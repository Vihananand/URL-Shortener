import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { JwtPayload } from "jsonwebtoken";
import { createRateLimiter } from "@/lib/rateLimiter";
import { withSecurityHeaders, sanitizeErrorMessage } from "@/lib/security";

// Rate limiter: 2 account deletion attempts per day per user
const deleteAccountLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  maxRequests: 2,
});

export async function DELETE(req: NextRequest) {
  try {
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

    // Rate limit account deletion attempts
    const limitCheck = deleteAccountLimiter.checkLimit(`delete-account-${decoded.email}`);
    if (!limitCheck.allowed) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: "Too many deletion attempts. Please try again later." },
          { status: 429 }
        )
      );
    }

    // Get user ID
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

    // Start transaction - delete all related data
    await pool.query("BEGIN");

    try {
      // Delete analytics data
      await pool.query(
        `DELETE FROM analytics
         WHERE url_id IN (SELECT id FROM urls WHERE user_id = $1)`,
        [userId]
      );

      // Delete all URLs for this user
      await pool.query("DELETE FROM urls WHERE user_id = $1", [userId]);

      // Delete user
      await pool.query("DELETE FROM users WHERE id = $1", [userId]);

      // Commit transaction
      await pool.query("COMMIT");
    } catch (err) {
      // Rollback on error
      await pool.query("ROLLBACK");
      throw err;
    }

    const res = NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );

    // Clear the token cookie
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
