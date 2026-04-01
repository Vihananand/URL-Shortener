import bcrypt from "bcrypt";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rateLimiter";
import { validators, sanitizeEmail } from "@/lib/validators";
import { withSecurityHeaders, sanitizeErrorMessage } from "@/lib/security";

// Rate limiter: 10 login attempts per 15 minutes per IP
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
});

// Track failed attempts per email for account lockout
const failedAttempts: { [email: string]: { count: number; lastAttempt: number } } = {};

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Check rate limit by IP
    const ipLimitCheck = loginLimiter.checkLimit(`login-${ip}`);
    if (!ipLimitCheck.allowed) {
      const res = NextResponse.json(
        { message: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
      res.headers.set("Retry-After", String(Math.ceil((ipLimitCheck.resetTime - Date.now()) / 1000)));
      return withSecurityHeaders(res);
    }

    const { email, password } = await req.json();

    // Input validation
    if (!email || !password) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: "Missing email or password" },
          { status: 400 }
        )
      );
    }

    const sanitizedEmail = sanitizeEmail(email);

    // Check if account is locked
    const failedRecord = failedAttempts[sanitizedEmail];
    if (failedRecord && failedRecord.count >= 5) {
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes
      if (Date.now() - failedRecord.lastAttempt < lockoutDuration) {
        const timeRemaining = Math.ceil(
          (lockoutDuration - (Date.now() - failedRecord.lastAttempt)) / 1000
        );
        return withSecurityHeaders(
          NextResponse.json(
            { message: `Account temporarily locked. Try again in ${timeRemaining} seconds.` },
            { status: 429 }
          )
        );
      } else {
        // Reset failed attempts after lockout period
        delete failedAttempts[sanitizedEmail];
      }
    }

    // Fetch user
    const userResult = await pool.query(
      `SELECT id, full_name, email, password_hash FROM users WHERE LOWER(email) = $1`,
      [sanitizedEmail.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      // Track failed attempt
      failedAttempts[sanitizedEmail] = {
        count: (failedRecord?.count || 0) + 1,
        lastAttempt: Date.now(),
      };
      // Don't reveal if email exists (security best practice)
      return withSecurityHeaders(
        NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401 }
        )
      );
    }

    const user = userResult.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Track failed attempt
      failedAttempts[sanitizedEmail] = {
        count: (failedRecord?.count || 0) + 1,
        lastAttempt: Date.now(),
      };
      return withSecurityHeaders(
        NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401 }
        )
      );
    }

    // Clear failed attempts on successful login
    delete failedAttempts[sanitizedEmail];

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

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, type: "auth" },
      secret,
      { expiresIn: "24h" }
    );

    const res = NextResponse.json(
      {
        message: "Sign In Successful",
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
        },
      },
      { status: 200 }
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
    console.error("Login error:", err);
    const res = NextResponse.json(
      { message: sanitizeErrorMessage(err) },
      { status: 500 }
    );
    return withSecurityHeaders(res);
  }
}
