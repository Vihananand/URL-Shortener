import { verifyToken } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import type { JwtPayload } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decode = verifyToken(token) as JwtPayload;
    if (!decode) {
      return NextResponse.json(
        { message: "Invalid Token" },
        { status: 401 }
      );
    }

    const userData = await pool.query(
      `SELECT id, full_name, email FROM users WHERE email = $1`,
      [decode.email]
    );

    if (userData.rows.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const user = userData.rows[0];

    // Get stats for dashboard
    const urlStats = await pool.query(
      `SELECT COUNT(*) as total_urls, SUM(clicks) as total_clicks
       FROM urls WHERE user_id = $1`,
      [user.id]
    );

    const activeUrls = await pool.query(
      `SELECT COUNT(*) as active_count FROM urls
       WHERE user_id = $1 AND is_active = true`,
      [user.id]
    );

    const stats = urlStats.rows[0];

    return NextResponse.json(
      {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
        },
        dashboard: {
          totalUrls: parseInt(stats.total_urls),
          totalClicks: parseInt(stats.total_clicks) || 0,
          activeUrls: parseInt(activeUrls.rows[0].active_count),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
