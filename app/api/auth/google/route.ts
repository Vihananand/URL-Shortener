import { OAuth2Client } from "google-auth-library";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { withSecurityHeaders, sanitizeErrorMessage } from "@/lib/security";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sanitizeEmail } from "@/lib/validators";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const credential = body.credential;

    if (!credential) {
      return withSecurityHeaders(NextResponse.json({ message: "Missing Google credential" }, { status: 400 }));
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return withSecurityHeaders(NextResponse.json({ message: "Server Google Auth configuration error" }, { status: 500 }));
    }

    // Verify token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return withSecurityHeaders(NextResponse.json({ message: "Invalid Google token payload" }, { status: 400 }));
    }

    const email = sanitizeEmail(payload.email);
    const name = payload.name || "Google User";
    
    // Check if user exists
    const existingUser = await pool.query("SELECT id, full_name, email FROM users WHERE LOWER(email) = $1", [email.toLowerCase()]);
    
    let user;

    if (existingUser.rows.length === 0) {
      // User doesn't exist, create a new user.
      // Generate a dummy secure password hash since they use Google to login
      const dummyPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(dummyPassword, 12);
      
      const insertResult = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, created_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id, full_name, email`,
        [name, email, hashedPassword]
      );
      user = insertResult.rows[0];
    } else {
      user = existingUser.rows[0];
    }

    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      return withSecurityHeaders(NextResponse.json({ message: "Server configuration error" }, { status: 500 }));
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, type: "auth" },
      secret,
      { expiresIn: "24h" }
    );

    const res = NextResponse.json(
      { message: "Authentication Successful", user: { id: user.id, full_name: user.full_name, email: user.email } },
      { status: 200 }
    );

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return withSecurityHeaders(res);

  } catch (err) {
    console.error("Google auth error:", err);
    return withSecurityHeaders(NextResponse.json({ message: sanitizeErrorMessage(err) || "Authentication failed" }, { status: 500 }));
  }
}
