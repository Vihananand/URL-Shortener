import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { withSecurityHeaders, verifyOrigin } from "@/lib/security";
import { redis } from "@/lib/redis";
import pool from "@/lib/db";
import { sendEmailOTP } from "@/lib/email";
import crypto from "crypto";
export async function POST(req: NextRequest) {
  try {
    if (!verifyOrigin(req)) {
      return withSecurityHeaders(NextResponse.json({ message: "Forbidden" }, { status: 403 }));
    }
    const { tempToken } = await req.json();
    if (!tempToken) {
      return withSecurityHeaders(NextResponse.json({ message: "Missing token" }, { status: 400 }));
    }
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
    const userResult = await pool.query(
      "SELECT id, email, is_2fa_enabled, two_factor_method FROM users WHERE email = $1",
      [decoded.email]
    );
    if (userResult.rows.length === 0) {
      return withSecurityHeaders(NextResponse.json({ message: "User not found" }, { status: 404 }));
    }
    const user = userResult.rows[0];
    if (!user.is_2fa_enabled || (user.two_factor_method !== "email" && user.two_factor_method !== "both")) {
      return withSecurityHeaders(NextResponse.json({ message: "Email 2FA is not enabled for this account" }, { status: 400 }));
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    await redis.set(`email_2fa:${user.email}`, otp, { ex: 300 });
    const sent = await sendEmailOTP(user.email, otp);
    if (!sent) {
      return withSecurityHeaders(NextResponse.json({ message: "Failed to send email" }, { status: 500 }));
    }
    return withSecurityHeaders(NextResponse.json({ message: "OTP sent to email" }));
  } catch (err) {
    console.error("2FA Send Email OTP Error:", err);
    return withSecurityHeaders(NextResponse.json({ message: "Internal Server Error" }, { status: 500 }));
  }
}
