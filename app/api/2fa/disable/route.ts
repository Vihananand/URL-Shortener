import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import type { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { withSecurityHeaders, verifyOrigin } from "@/lib/security";
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
    const { method } = await req.json().catch(() => ({ method: null }));
    const userResult = await pool.query("SELECT two_factor_method FROM users WHERE email = $1", [decoded.email]);
    if (userResult.rows.length === 0) {
      return withSecurityHeaders(NextResponse.json({ message: "User not found" }, { status: 404 }));
    }
    const currentMethod = userResult.rows[0].two_factor_method;
    if (currentMethod === "both") {
      if (method === "totp") {
        await pool.query(
          "UPDATE users SET two_factor_method = 'email', totp_secret = NULL WHERE email = $1",
          [decoded.email]
        );
      } else if (method === "email") {
        await pool.query(
          "UPDATE users SET two_factor_method = 'totp' WHERE email = $1",
          [decoded.email]
        );
      } else {
        await pool.query(
          "UPDATE users SET is_2fa_enabled = false, two_factor_method = NULL, totp_secret = NULL WHERE email = $1",
          [decoded.email]
        );
      }
    } else {
      await pool.query(
        "UPDATE users SET is_2fa_enabled = false, two_factor_method = NULL, totp_secret = NULL WHERE email = $1",
        [decoded.email]
      );
    }
    return withSecurityHeaders(NextResponse.json({ message: "2FA Disabled Successfully" }));
  } catch (err) {
    console.error("2FA Disable Error:", err);
    return withSecurityHeaders(NextResponse.json({ message: "Internal Server Error" }, { status: 500 }));
  }
}
