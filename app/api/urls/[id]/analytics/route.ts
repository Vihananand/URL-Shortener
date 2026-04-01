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

function getDeviceType(userAgent: string): "Desktop" | "Mobile" | "Tablet" {
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) return "Tablet";
  if (/mobile|android|iphone|ipod|phone/i.test(userAgent)) return "Mobile";
  return "Desktop";
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

    // Get analytics data
    const analyticsData = await pool.query(
      `SELECT id, ip_address, user_agent, referrer, created_at
       FROM analytics
       WHERE url_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    const clicks = analyticsData.rows;
    const uniqueIPs = new Set(clicks.map((c: any) => c.ip_address)).size;

    // Calculate last clicked date
    const lastClicked =
      clicks.length > 0
        ? new Date(clicks[0].created_at).toISOString()
        : new Date().toISOString();

    // Calculate first clicked date
    const firstClicked =
      clicks.length > 0
        ? new Date(clicks[clicks.length - 1].created_at).toISOString()
        : new Date().toISOString();

    // Count days with clicks
    const daysWithClicks = new Set(
      clicks.map((c: any) =>
        new Date(c.created_at).toLocaleDateString("en-US")
      )
    ).size;

    // Device breakdown
    const deviceBreakdown: Record<string, number> = {
      Desktop: 0,
      Mobile: 0,
      Tablet: 0,
    };

    clicks.forEach((click: any) => {
      const deviceType = getDeviceType(click.user_agent);
      deviceBreakdown[deviceType]++;
    });

    // Top referrers
    const referrerMap: Record<string, number> = {};
    clicks.forEach((click: any) => {
      const referrer = click.referrer || "Direct";
      referrerMap[referrer] = (referrerMap[referrer] || 0) + 1;
    });

    const topReferrers = Object.entries(referrerMap)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Hourly clicks (last 24 hours)
    const now = new Date();
    const hourlyClicks: Record<string, number> = {};

    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourKey = hour.toISOString().substring(0, 13);
      hourlyClicks[hourKey] = 0;
    }

    clicks.forEach((click: any) => {
      const clickTime = new Date(click.created_at);
      const hourKey = clickTime.toISOString().substring(0, 13);
      if (hourKey in hourlyClicks) {
        hourlyClicks[hourKey]++;
      }
    });

    const hourlyClicksArray = Object.entries(hourlyClicks).map(
      ([hour, count]) => ({
        hour,
        count,
      })
    );

    // Recent clicks with device type
    const recentClicks = clicks.slice(0, 50).map((click: any) => ({
      id: click.id,
      timestamp: click.created_at,
      ipAddress: click.ip_address,
      userAgent: click.user_agent,
      referrer: click.referrer,
      deviceType: getDeviceType(click.user_agent),
    }));

    return NextResponse.json(
      {
        shortCode: url.short_code,
        summary: {
          totalClicks: url.clicks,
          uniqueVisitors: uniqueIPs,
          daysWithClicks,
          lastClicked,
          firstClicked,
        },
        deviceBreakdown: Object.entries(deviceBreakdown).map(
          ([deviceType, count]) => ({
            deviceType,
            count,
          })
        ),
        topReferrers,
        hourlyClicks: hourlyClicksArray,
        recentClicks,
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
