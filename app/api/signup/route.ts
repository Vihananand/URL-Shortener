import bcrypt from "bcrypt";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rateLimiter";
import { validators, sanitizeEmail } from "@/lib/validators";
import { withSecurityHeaders, sanitizeErrorMessage } from "@/lib/security";

// Rate limiter: 5 signup attempts per 15 minutes per IP
const signupLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
});

export async function POST(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Check rate limit
    const limitCheck = signupLimiter.checkLimit(`signup-${ip}`);
    if (!limitCheck.allowed) {
      const res = NextResponse.json(
        { message: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
      res.headers.set("Retry-After", String(Math.ceil((limitCheck.resetTime - Date.now()) / 1000)));
      return withSecurityHeaders(res);
    }

    const { name, email, password } = await req.json();

    // Input validation
    if (!name || !email || !password) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: "Missing required fields" },
          { status: 400 }
        )
      );
    }

    // Validate email format
    const emailValidation = validators.email(email);
    if (!emailValidation.valid) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: emailValidation.error },
          { status: 400 }
        )
      );
    }

    // Validate password strength
    const passwordValidation = validators.password(password);
    if (!passwordValidation.valid) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: passwordValidation.error },
          { status: 400 }
        )
      );
    }

    // Validate name
    const nameValidation = validators.name(name);
    if (!nameValidation.valid) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: nameValidation.error },
          { status: 400 }
        )
      );
    }

    const sanitizedEmail = sanitizeEmail(email);

    // Check if user exists (case-insensitive)
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = $1",
      [sanitizedEmail.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      // Don't reveal if email exists (security best practice)
      return withSecurityHeaders(
        NextResponse.json(
          { message: "Signup successful. Please check your email to verify." },
          { status: 200 }
        )
      );
    }

    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      console.error("JWT_SECRET_KEY not configured");
      return withSecurityHeaders(
        NextResponse.json(
          { message: "Server configuration error" },
          { status: 500 }
        )
      );
    }

    // Hash password with higher cost factor (12 rounds for better security)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user
    await pool.query(
      `INSERT INTO users (full_name, email, password_hash, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [name, sanitizedEmail, hashedPassword]
    );

    // Generate JWT token with shorter expiry for security
    const token = jwt.sign(
      { email: sanitizedEmail, type: "auth" },
      secret,
      { expiresIn: "24h" }
    );

    const res = NextResponse.json(
      { message: "SignUp Successful" },
      { status: 201 }
    );

    // Set secure cookie
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return withSecurityHeaders(res);
  } catch (err) {
    console.error("Signup error:", err);
    const res = NextResponse.json(
      { message: sanitizeErrorMessage(err) },
      { status: 500 }
    );
    return withSecurityHeaders(res);
  }
}
