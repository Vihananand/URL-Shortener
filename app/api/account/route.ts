import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { JwtPayload } from "jsonwebtoken";
import { createRateLimiter } from "@/lib/rateLimiter";
import { withSecurityHeaders, sanitizeErrorMessage, verifyOrigin } from "@/lib/security";
const deleteAccountLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  maxRequests: 2,
});
export async function DELETE(req: NextRequest) {
  try {
    if (!verifyOrigin(req)) {
      return withSecurityHeaders(NextResponse.json({ message: "Forbidden - Invalid Origin" }, { status: 403 }));
    }
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: "Unauthorized" },
          { status: 401 }
        )
      );
    }
    const decoded = verifyToken(token) as JwtPayload;
    if (!decoded || !decoded.email) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: "Invalid Token" },
          { status: 401 }
        )
      );
    }
    const limitCheck = await deleteAccountLimiter.checkLimit(`delete-account-${decoded.email}`);
    if (!limitCheck.allowed) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: "Too many deletion attempts. Please try again later." },
          { status: 429 }
        )
      );
    }
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [decoded.email]
    );
    if (userResult.rows.length === 0) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        )
      );
    }
    const userId = userResult.rows[0].id;
    await pool.query("BEGIN");
    try {
      await pool.query(
        `DELETE FROM analytics
         WHERE url_id IN (SELECT id FROM urls WHERE user_id = $1)`,
        [userId]
      );
      await pool.query("DELETE FROM urls WHERE user_id = $1", [userId]);
      await pool.query("DELETE FROM users WHERE id = $1", [userId]);
      await pool.query("COMMIT");
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
    const res = NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );
    res.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
    return withSecurityHeaders(res);
  } catch (err) {
    console.error("Account deletion error:", err);
    const res = NextResponse.json(
      { message: sanitizeErrorMessage(err) },
      { status: 500 }
    );
    return withSecurityHeaders(res);
  }
}
export async function PATCH(req: NextRequest) {
  try {
    if (!verifyOrigin(req)) {
      return withSecurityHeaders(NextResponse.json({ message: "Forbidden - Invalid Origin" }, { status: 403 }));
    }
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return withSecurityHeaders(NextResponse.json({ message: "Unauthorized" }, { status: 401 }));
    }
    const decoded = verifyToken(token) as JwtPayload;
    if (!decoded || !decoded.email) {
      return withSecurityHeaders(NextResponse.json({ message: "Invalid Token" }, { status: 401 }));
    }
    const body = await req.json();
    if (typeof body.is_virus_total_scan_enabled !== "undefined") {
      await pool.query(
        "UPDATE users SET is_virus_total_scan_enabled = $1 WHERE email = $2",
        [body.is_virus_total_scan_enabled, decoded.email]
      );
    }
    return withSecurityHeaders(NextResponse.json({ message: "Settings updated successfully" }, { status: 200 }));
  } catch (err) {
    console.error("Account update error:", err);
    return withSecurityHeaders(NextResponse.json({ message: sanitizeErrorMessage(err) }, { status: 500 }));
  }
}
