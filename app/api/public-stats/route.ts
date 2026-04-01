import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM urls) AS total_urls,
        (SELECT COALESCE(SUM(clicks), 0)::bigint FROM urls) AS total_clicks,
        (SELECT COUNT(*)::int FROM users) AS total_users,
        (SELECT COUNT(*)::int FROM urls WHERE is_active = true) AS active_urls
    `);

    const row = result.rows[0];

    return NextResponse.json(
      {
        totalUrls: Number(row.total_urls) || 0,
        totalClicks: Number(row.total_clicks) || 0,
        totalUsers: Number(row.total_users) || 0,
        activeUrls: Number(row.active_urls) || 0,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Public stats error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
