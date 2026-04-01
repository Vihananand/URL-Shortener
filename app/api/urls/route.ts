import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { generateShortCode } from "@/lib/utils";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { JwtPayload } from "jsonwebtoken";

export async function POST(req: NextRequest) {
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

    const { originalUrl, customSlug } = await req.json();

    if (!originalUrl) {
      return NextResponse.json(
        { message: "Original URL is required" },
        { status: 400 }
      );
    }

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
    const shortCode = customSlug || generateShortCode();

    // Check if custom slug already exists
    if (customSlug) {
      const existingUrl = await pool.query(
        "SELECT id FROM urls WHERE short_code = $1",
        [customSlug]
      );
      if (existingUrl.rows.length > 0) {
        return NextResponse.json(
          { message: "This custom slug is already taken" },
          { status: 409 }
        );
      }
    }

    // Insert new URL
    const result = await pool.query(
      `INSERT INTO urls (user_id, original_url, short_code, clicks, is_active)
       VALUES ($1, $2, $3, 0, true)
       RETURNING id, original_url, short_code, clicks, is_active, created_at`,
      [userId, originalUrl, shortCode]
    );

    const url = result.rows[0];

    return NextResponse.json(
      {
        message: "URL shortened successfully",
        url: {
          id: url.id,
          originalUrl: url.original_url,
          shortCode: url.short_code,
          shortUrl: `https://snip.ly/${url.short_code}`,
          clicks: url.clicks,
          isActive: url.is_active,
          createdAt: url.created_at,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
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

    // Get all URLs for user, sorted by creation date (newest first)
    const result = await pool.query(
      `SELECT id, original_url, short_code, clicks, is_active, created_at
       FROM urls
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const urls = result.rows.map((url) => ({
      id: url.id,
      originalUrl: url.original_url,
      shortCode: url.short_code,
      shortUrl: `https://snip.ly/${url.short_code}`,
      clicks: url.clicks,
      isActive: url.is_active,
      createdAt: url.created_at,
    }));

    return NextResponse.json(
      { urls },
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
