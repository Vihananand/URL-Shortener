import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { JwtPayload } from "jsonwebtoken";
import { createRateLimiter } from "@/lib/rateLimiter";
import { withSecurityHeaders, sanitizeErrorMessage } from "@/lib/security";

// Rate limiter: 50 stats requests per hour per user
const statLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 50,
});

export async function GET(req: NextRequest) {
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

    // Rate limit
    const limitCheck = statLimiter.checkLimit(`stats-${decoded.email}`);
    if (!limitCheck.allowed) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: "Rate limit exceeded" },
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

    // Get URL ID from query params
    const { searchParams } = new URL(req.url);
    const urlId = searchParams.get("urlId");

    if (!urlId) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: "URL ID is required" },
          { status: 400 }
        )
      );
    }

    // Verify URL belongs to user
    const urlResult = await pool.query(
      "SELECT id FROM urls WHERE id = $1 AND user_id = $2",
      [urlId, userId]
    );

    if (urlResult.rows.length === 0) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: "URL not found" },
          { status: 404 }
        )
      );
    }

    // Get daily stats from materialized view
    const statsResult = await pool.query(
      `SELECT
        url_id,
        short_code,
        date,
        clicks,
        unique_visitors
       FROM daily_stats
       WHERE url_id = $1
       ORDER BY date DESC
       LIMIT 90`,
      [urlId]
    );

    const dailyStats = statsResult.rows.map((row: any) => ({
      date: new Date(row.date).toISOString().split("T")[0],
      clicks: row.clicks,
      uniqueVisitors: row.unique_visitors,
    }));

    return withSecurityHeaders(
      NextResponse.json(
        { dailyStats },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("Stats error:", err);
    return withSecurityHeaders(
      NextResponse.json(
        { message: sanitizeErrorMessage(err) },
        { status: 500 }
      )
    );
  }
}
