import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import type { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { withSecurityHeaders, verifyOrigin } from "@/lib/security";
import { verifySync } from "otplib";
import { redis } from "@/lib/redis";
import pool from "@/lib/db";
export async function POST(req: NextRequest) {
  try {
    if (!verifyOrigin(req)) {
      return withSecurityHeaders(NextResponse.json({ message: "Forbidden" }, { status: 403 }));
    }
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return withSecurityHeaders(NextResponse.json({ message: "Unauthorized" }, { status: 401 }));
    const decoded = verifyToken(token) as JwtPayload;
    if (!decoded || !decoded.email) {
      return withSecurityHeaders(NextResponse.json({ message: "Invalid Token" }, { status: 401 }));
    }
    const { method, code } = await req.json();
    if (!code) {
      return withSecurityHeaders(NextResponse.json({ message: "Code is required" }, { status: 400 }));
    }
    const userResult = await pool.query("SELECT two_factor_method FROM users WHERE email = $1", [decoded.email]);
    if (userResult.rows.length === 0) {
      return withSecurityHeaders(NextResponse.json({ message: "User not found" }, { status: 404 }));
    }
    const currentMethod = userResult.rows[0].two_factor_method;
    if (method === "totp") {
      const secret = await redis.get(`totp_setup:${decoded.email}`) as string;
      if (!secret) {
        return withSecurityHeaders(NextResponse.json({ message: "Setup session expired, please try again." }, { status: 400 }));
      }
      const isValid = verifySync({ token: code, secret });
      if (!isValid) {
        return withSecurityHeaders(NextResponse.json({ message: "Invalid verification code" }, { status: 400 }));
      }
      const newMethod = currentMethod === "email" || currentMethod === "both" ? "both" : "totp";
      await pool.query(
        "UPDATE users SET is_2fa_enabled = true, two_factor_method = $1, totp_secret = $2 WHERE email = $3",
        [newMethod, secret, decoded.email]
      );
      await redis.del(`totp_setup:${decoded.email}`);
      return withSecurityHeaders(NextResponse.json({ message: "2FA Enabled Successfully" }));
    } 
    if (method === "email") {
      const otp = await redis.get(`email_setup:${decoded.email}`) as string;
      if (!otp) {
        return withSecurityHeaders(NextResponse.json({ message: "Setup session expired, please try again." }, { status: 400 }));
      }
      if (String(otp) !== String(code)) {
        return withSecurityHeaders(NextResponse.json({ message: "Invalid verification code" }, { status: 400 }));
      }
      const newMethod = currentMethod === "totp" || currentMethod === "both" ? "both" : "email";
      await pool.query(
        "UPDATE users SET is_2fa_enabled = true, two_factor_method = $1 WHERE email = $2",
        [newMethod, decoded.email]
      );
      await redis.del(`email_setup:${decoded.email}`);
      return withSecurityHeaders(NextResponse.json({ message: "2FA Enabled Successfully" }));
    }
    return withSecurityHeaders(NextResponse.json({ message: "Invalid method" }, { status: 400 }));
  } catch (err) {
    console.error("2FA Enable Error:", err);
    return withSecurityHeaders(NextResponse.json({ message: "Internal Server Error" }, { status: 500 }));
  }
}
