import pool from "@/lib/db";
import { redis } from "@/lib/redis";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { createRateLimiter } from "@/lib/rateLimiter";
interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}
const passwordLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
});
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const headersList = await headers();
    const rawIp =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      headersList.get("cf-connecting-ip") ||
      "unknown";
    const ipAddress = rawIp.split(",")[0].trim().substring(0, 45);
    const rateLimitResult = await passwordLimiter.checkLimit(ipAddress);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { message: "Too many attempts, please try again later" },
        { status: 429 }
      );
    }
    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ message: "Password is required" }, { status: 400 });
    }
    const cacheKey = `url:${slug}`;
    let url: any = await redis.get(cacheKey);
    if (!url) {
      const result = await pool.query(
        `SELECT id, original_url, is_active, expires_at, max_clicks, clicks, password_hash FROM urls WHERE short_code = $1`,
        [slug]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ message: "Link not found" }, { status: 404 });
      }
      url = result.rows[0];
      await redis.set(cacheKey, url);
    }
    if (!url.is_active || (url.expires_at && new Date() > new Date(url.expires_at)) || (url.max_clicks !== null && url.clicks >= url.max_clicks)) {
      return NextResponse.json({ message: "Link is no longer available" }, { status: 403 });
    }
    if (!url.password_hash) {
      return NextResponse.json({ originalUrl: url.original_url });
    }
    const isMatch = await bcrypt.compare(password, url.password_hash);
    if (!isMatch) {
      return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
    }
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
    return NextResponse.json({ originalUrl: url.original_url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
