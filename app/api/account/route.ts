import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { JwtPayload } from "jsonwebtoken";

export async function DELETE(req: NextRequest) {
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

    // Delete all URLs for this user first
    await pool.query("DELETE FROM urls WHERE user_id = $1", [userId]);

    // Delete user
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    const res = NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );

    // Clear the token cookie
    res.cookies.set("token", "", {
      httpOnly: true,
      maxAge: 0,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
