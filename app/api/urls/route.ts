import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { generateShortCode } from "@/lib/utils";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { JwtPayload } from "jsonwebtoken";
import { createRateLimiter } from "@/lib/rateLimiter";
import { validators } from "@/lib/validators";
import { withSecurityHeaders, sanitizeErrorMessage, verifyOrigin } from "@/lib/security";
import { APP_URL } from "@/lib/site";
import bcrypt from "bcrypt";
const createUrlLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 30,
});
const getUrlsLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 100,
});
export async function POST(req: NextRequest) {
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
    const limitCheck = await createUrlLimiter.checkLimit(`create-url-${decoded.email}`);
    if (!limitCheck.allowed) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: "Rate limit exceeded" },
          { status: 429 }
        )
      );
    }
    const { originalUrl, customSlug, deleteAfter24h, customExpiryDate, maxClicks, password } = await req.json();
    if (!originalUrl) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: "Original URL is required" },
          { status: 400 }
        )
      );
    }
    const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(originalUrl);
    const normalizedUrl = hasProtocol ? originalUrl : `https://${originalUrl}`;
    const userResult = await pool.query(
      "SELECT id, is_virus_total_scan_enabled FROM users WHERE email = $1",
      [decoded.email]
    );
    if (userResult.rows.length === 0) {
      return withSecurityHeaders(NextResponse.json({ message: "User not found" }, { status: 404 }));
    }
    const userId = userResult.rows[0].id;
    const isScanEnabled = userResult.rows[0].is_virus_total_scan_enabled !== false;
    if (isScanEnabled && process.env.VIRUSTOTAL_API_KEY) {
      const urlId = Buffer.from(normalizedUrl).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\
      try {
        const vtRes = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
          headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY }
        });
        if (vtRes.ok) {
          const vtData = await vtRes.json();
          const maliciousCount = vtData.data?.attributes?.last_analysis_stats?.malicious || 0;
          if (maliciousCount > 0) {
            return withSecurityHeaders(NextResponse.json({ 
              message: "This link is flagged as malicious. You can turn off 'Secured Redirect' in your account settings to bypass this check." 
            }, { status: 400 }));
          }
        }
      } catch (e) {
        console.error("VT check failed", e);
      }
    }
    const urlValidation = validators.url(normalizedUrl);
    if (!urlValidation.valid) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: urlValidation.error },
          { status: 400 }
        )
      );
    }
    if (customSlug) {
      const slugValidation = validators.slug(customSlug);
      if (!slugValidation.valid) {
        return withSecurityHeaders(
          NextResponse.json(
            { message: slugValidation.error },
            { status: 400 }
          )
        );
      }
    }
    const shortCode = customSlug || generateShortCode();
    if (customSlug) {
      const existingUrl = await pool.query(
        "SELECT id FROM urls WHERE short_code = $1 AND user_id != $2",
        [customSlug, userId]
      );
      if (existingUrl.rows.length > 0) {
        return withSecurityHeaders(
          NextResponse.json(
            { message: "This custom slug is already taken" },
            { status: 409 }
          )
        );
      }
    }
    let finalExpiresAt: Date | null = null;
    if (deleteAfter24h) {
      finalExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else if (customExpiryDate) {
      finalExpiresAt = new Date(customExpiryDate);
    }
    let passwordHash = null;
    if (password && typeof password === "string" && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }
    const result = await pool.query(
      `INSERT INTO urls (user_id, original_url, short_code, clicks, is_active, created_at, expires_at, max_clicks, password_hash)
       VALUES ($1, $2, $3, 0, true, CURRENT_TIMESTAMP, $4, $5, $6)
       RETURNING id, original_url, short_code, clicks, is_active, created_at`,
      [userId, normalizedUrl, shortCode, finalExpiresAt, maxClicks || null, passwordHash]
    );
    const url = result.rows[0];
    return withSecurityHeaders(
      NextResponse.json(
        {
          message: "URL shortened successfully",
          url: {
            id: url.id,
            originalUrl: url.original_url,
            shortCode: url.short_code,
            shortUrl: `${APP_URL}/${url.short_code}`,
            clicks: url.clicks,
            isActive: url.is_active,
            createdAt: url.created_at,
          },
        },
        { status: 201 }
      )
    );
  } catch (err) {
    console.error(err);
    return withSecurityHeaders(
      NextResponse.json(
        { message: sanitizeErrorMessage(err) },
        { status: 500 }
      )
    );
  }
}
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
    const limitCheck = await getUrlsLimiter.checkLimit(`get-urls-${decoded.email}`);
    if (!limitCheck.allowed) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: "Rate limit exceeded" },
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
    const result = await pool.query(
      `SELECT id, original_url, short_code, clicks, is_active, created_at
       FROM urls
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1000`,
      [userId]
    );
    const urls = result.rows.map((url) => ({
      id: url.id,
      originalUrl: url.original_url,
      shortCode: url.short_code,
      shortUrl: `${APP_URL}/${url.short_code}`,
      clicks: url.clicks,
      isActive: url.is_active,
      createdAt: url.created_at,
    }));
    return withSecurityHeaders(
      NextResponse.json(
        { urls },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error(err);
    return withSecurityHeaders(
      NextResponse.json(
        { message: sanitizeErrorMessage(err) },
        { status: 500 }
      )
    );
  }
}
