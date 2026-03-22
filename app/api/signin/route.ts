import bcrypt from "bcrypt";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    // fetching user details
    const existingUser = await pool.query(
      `SELECT id, email, password_hash FROM users WHERE email = $1`,
      [email],
    );

    if (existingUser.rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid Credentials" },
        { status: 404 },
      );
    }

    const user = existingUser.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 404 },
      );
    }

    // generating json web token
    const token = jwt.sign({ email }, secret, { expiresIn: "1d" });

    const res = NextResponse.json(
      { message: "Sign In Sucessfull" },
      { status: 200 },
    );

    // storing token as cookie
    res.cookies.set("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      secure: process.env.NODE_ENV == "production",
      sameSite: "strict",
      path: "/",
    });

    return res;
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
