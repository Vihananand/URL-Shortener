import pool from "@/lib/db";
import { redis } from "@/lib/redis";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const cacheKey = `url:${slug}`;
    let url: any = await redis.get(cacheKey);
    if (!url) {
      const result = await pool.query(
        `SELECT id, original_url, is_active, expires_at, max_clicks, clicks, password_hash FROM urls WHERE short_code = $1`,
        [slug]
      );
      if (result.rows.length === 0) {
        return NextResponse.redirect(new URL("/?error=link-not-found", req.url));
      }
      url = result.rows[0];
      await redis.set(cacheKey, url);
    }
    if (!url.is_active) {
      return NextResponse.redirect(new URL("/disabled", req.url));
    }
    if (url.expires_at && new Date() > new Date(url.expires_at)) {
      return NextResponse.redirect(new URL("/?error=link-expired", req.url));
    }
    if (url.max_clicks !== null && url.clicks >= url.max_clicks) {
      return NextResponse.redirect(new URL("/?error=max-clicks-reached", req.url));
    }
    if (url.password_hash) {
      return NextResponse.redirect(new URL(`/secure/${slug}`, req.url));
    }
    const headersList = await headers();
    const rawIp =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      headersList.get("cf-connecting-ip") ||
      "unknown";
    const ipAddress = rawIp.split(",")[0].trim().substring(0, 45);
    const userAgent = (headersList.get("user-agent") || "unknown").substring(0, 1000); 
    const referrer = (headersList.get("referer") || null)?.substring(0, 500) || null;
    await Promise.all([
      pool.query(`UPDATE urls SET clicks = clicks + 1 WHERE id = $1`, [url.id]),
      pool.query(
        `INSERT INTO analytics (url_id, ip_address, user_agent, referrer)
         VALUES ($1, $2, $3, $4)`,
        [url.id, ipAddress, userAgent, referrer]
      ),
      url.max_clicks !== null ? redis.set(cacheKey, { ...url, clicks: url.clicks + 1 }) : Promise.resolve(),
    ]);
    return NextResponse.redirect(url.original_url);
  } catch (err) {
    console.error("Redirect Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.redirect(new URL(`/?error=redirect-failed&details=${encodeURIComponent(errorMessage)}`, req.url));
  }
}
