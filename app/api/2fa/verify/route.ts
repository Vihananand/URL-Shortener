import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import type { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { withSecurityHeaders, verifyOrigin } from "@/lib/security";
import { verifySync } from "otplib";
import { redis } from "@/lib/redis";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    if (!verifyOrigin(req)) {
      return withSecurityHeaders(NextResponse.json({ message: "Forbidden" }, { status: 403 }));
    }

    const { tempToken, code, method } = await req.json();

    if (!tempToken || !code || !method) {
      return withSecurityHeaders(NextResponse.json({ message: "Missing token, code, or method" }, { status: 400 }));
    }

    // Verify temp token
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) return withSecurityHeaders(NextResponse.json({ message: "Server configuration error" }, { status: 500 }));

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(tempToken, secret) as JwtPayload;
    } catch {
      return withSecurityHeaders(NextResponse.json({ message: "Invalid or expired token" }, { status: 401 }));
    }

    if (decoded.type !== "2fa_pending" || !decoded.email) {
      return withSecurityHeaders(NextResponse.json({ message: "Invalid token type" }, { status: 401 }));
    }

    // Get user from DB
    const userResult = await pool.query(
      "SELECT id, full_name, email, is_2fa_enabled, two_factor_method, totp_secret FROM users WHERE email = $1",
      [decoded.email]
    );

    if (userResult.rows.length === 0) {
      return withSecurityHeaders(NextResponse.json({ message: "User not found" }, { status: 404 }));
    }

    const user = userResult.rows[0];

    if (!user.is_2fa_enabled) {
      return withSecurityHeaders(NextResponse.json({ message: "2FA is not enabled for this account" }, { status: 400 }));
    }

    // Verify code
    if (method === "totp" && (user.two_factor_method === "totp" || user.two_factor_method === "both")) {
      const isValid = verifySync({ token: code, secret: user.totp_secret });
      if (!isValid) {
        return withSecurityHeaders(NextResponse.json({ message: "Invalid code" }, { status: 401 }));
      }
    } else if (method === "email" && (user.two_factor_method === "email" || user.two_factor_method === "both")) {
      const otp = await redis.get(`email_2fa:${user.email}`) as string;
      if (!otp || String(otp) !== String(code)) {
        return withSecurityHeaders(NextResponse.json({ message: "Invalid or expired code" }, { status: 401 }));
      }
      await redis.del(`email_2fa:${user.email}`);
    } else {
      return withSecurityHeaders(NextResponse.json({ message: "Unknown or unauthorized 2FA method" }, { status: 400 }));
    }

    // Success! Generate full auth token
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

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return withSecurityHeaders(res);
  } catch (err) {
    console.error("2FA Verify Error:", err);
    return withSecurityHeaders(NextResponse.json({ message: "Internal Server Error" }, { status: 500 }));
  }
}
