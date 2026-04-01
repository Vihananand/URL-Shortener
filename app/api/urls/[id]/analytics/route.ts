import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { JwtPayload } from "jsonwebtoken";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token) as JwtPayload;
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid Token" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get user ID
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [decoded.email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id;

    // Verify URL belongs to user
    const urlResult = await pool.query(
      "SELECT short_code, clicks FROM urls WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (urlResult.rows.length === 0) {
      return NextResponse.json(
        { message: "URL not found" },
        { status: 404 }
      );
    }

    const url = urlResult.rows[0];

    // Get analytics for this URL
    const analyticsResult = await pool.query(
      `SELECT
        id,
        clicked_at,
        ip_address,
        user_agent,
        referrer,
        CASE
          WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
          WHEN user_agent LIKE '%iPad%' THEN 'Tablet'
          ELSE 'Desktop'
        END as device_type
       FROM analytics
       WHERE url_id = $1
       ORDER BY clicked_at DESC
       LIMIT 100`,
      [id]
    );

    // Get analytics summary
    const summaryResult = await pool.query(
      `SELECT
        COUNT(*) as total_clicks,
        COUNT(DISTINCT ip_address) as unique_visitors,
        COUNT(DISTINCT DATE(clicked_at)) as days_with_clicks,
        MAX(clicked_at) as last_clicked,
        MIN(clicked_at) as first_clicked
       FROM analytics
       WHERE url_id = $1`,
      [id]
    );

    // Get device breakdown
    const deviceResult = await pool.query(
      `SELECT
        CASE
          WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
          WHEN user_agent LIKE '%iPad%' THEN 'Tablet'
          ELSE 'Desktop'
        END as device_type,
        COUNT(*) as count
       FROM analytics
       WHERE url_id = $1
       GROUP BY device_type`,
      [id]
    );

    // Get referrer breakdown
    const referrerResult = await pool.query(
      `SELECT referrer, COUNT(*) as count
       FROM analytics
       WHERE url_id = $1 AND referrer IS NOT NULL
       GROUP BY referrer
       ORDER BY count DESC
       LIMIT 10`,
      [id]
    );

    // Get hourly clicks (last 24 hours)
    const hourlyResult = await pool.query(
      `SELECT
        DATE_TRUNC('hour', clicked_at) as hour,
        COUNT(*) as count
       FROM analytics
       WHERE url_id = $1 AND clicked_at > NOW() - INTERVAL '24 hours'
       GROUP BY DATE_TRUNC('hour', clicked_at)
       ORDER BY hour DESC`,
      [id]
    );

    const summary = summaryResult.rows[0];
    const clicks = analyticsResult.rows;
    const devices = deviceResult.rows;
    const referrers = referrerResult.rows;
    const hourly = hourlyResult.rows;

    return NextResponse.json(
      {
        shortCode: url.short_code,
        summary: {
          totalClicks: parseInt(summary.total_clicks),
          uniqueVisitors: parseInt(summary.unique_visitors),
          daysWithClicks: parseInt(summary.days_with_clicks),
          lastClicked: summary.last_clicked,
          firstClicked: summary.first_clicked,
        },
        deviceBreakdown: devices.map((d) => ({
          deviceType: d.device_type,
          count: parseInt(d.count),
        })),
        topReferrers: referrers.map((r) => ({
          referrer: r.referrer || "Direct",
          count: parseInt(r.count),
        })),
        hourlyClicks: hourly.map((h) => ({
          hour: h.hour,
          count: parseInt(h.count),
        })),
        recentClicks: clicks.map((c) => ({
          id: c.id,
          timestamp: c.clicked_at,
          ipAddress: c.ip_address,
          userAgent: c.user_agent,
          referrer: c.referrer,
          deviceType: c.device_type,
        })),
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
