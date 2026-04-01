import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { generateShortCode } from "@/lib/utils";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { JwtPayload } from "jsonwebtoken";
import { createRateLimiter } from "@/lib/rateLimiter";
import { validators } from "@/lib/validators";
import { withSecurityHeaders, sanitizeErrorMessage } from "@/lib/security";
import { APP_URL } from "@/lib/site";

// Rate limiter: 30 URL creations per hour per user
const createUrlLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 30,
});

// Rate limiter: 100 URL reads per hour per user
const getUrlsLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 100,
});

export async function POST(req: NextRequest) {
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

    // Rate limit by user email
    const limitCheck = createUrlLimiter.checkLimit(`create-url-${decoded.email}`);
    if (!limitCheck.allowed) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: "Rate limit exceeded" },
          { status: 429 }
        )
      );
    }

    const { originalUrl, customSlug } = await req.json();

    // Input validation
    if (!originalUrl) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: "Original URL is required" },
          { status: 400 }
        )
      );
    }

    // Validate URL
    const urlValidation = validators.url(originalUrl);
    if (!urlValidation.valid) {
      return withSecurityHeaders(
        NextResponse.json(
          { message: urlValidation.error },
          { status: 400 }
        )
      );
    }

    // Validate custom slug if provided
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
    const shortCode = customSlug || generateShortCode();

    // Check if custom slug already exists
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

    // Insert new URL
    const result = await pool.query(
      `INSERT INTO urls (user_id, original_url, short_code, clicks, is_active, created_at)
       VALUES ($1, $2, $3, 0, true, CURRENT_TIMESTAMP)
       RETURNING id, original_url, short_code, clicks, is_active, created_at`,
      [userId, originalUrl, shortCode]
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

    // Rate limit by user email
    const limitCheck = getUrlsLimiter.checkLimit(`get-urls-${decoded.email}`);
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

    // Get all URLs for user with limit
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
