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

export async function PUT(req: NextRequest, { params }: RouteParams) {
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
    const { isActive } = await req.json();

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
      "SELECT * FROM urls WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (urlResult.rows.length === 0) {
      return NextResponse.json(
        { message: "URL not found" },
        { status: 404 }
      );
    }

    // Update is_active status
    const updated = await pool.query(
      `UPDATE urls
       SET is_active = $1
       WHERE id = $2
       RETURNING id, original_url, short_code, clicks, is_active, created_at`,
      [isActive, id]
    );

    const url = updated.rows[0];

    return NextResponse.json(
      {
        message: "URL updated successfully",
        url: {
          id: url.id,
          originalUrl: url.original_url,
          shortCode: url.short_code,
          shortUrl: `https://url-shortener-chi-seven.vercel.app/${url.short_code}`,
          clicks: url.clicks,
          isActive: url.is_active,
          createdAt: url.created_at,
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

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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
      "SELECT * FROM urls WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (urlResult.rows.length === 0) {
      return NextResponse.json(
        { message: "URL not found" },
        { status: 404 }
      );
    }

    // Delete URL
    await pool.query("DELETE FROM urls WHERE id = $1", [id]);

    return NextResponse.json(
      { message: "URL deleted successfully" },
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
