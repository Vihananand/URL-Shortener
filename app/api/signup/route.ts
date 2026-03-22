import bcrypt from "bcrypt";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // check if user exists or not
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ message: "User Already Exists", status: 400 });
    }

    // safe way of importing secret key from env file
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    // hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3)`,
      [name, email, hashedPassword],
    );

    // generating jwt token
    const token = jwt.sign({ email }, secret, { expiresIn: "1d" });

    const res = NextResponse.json({ message: "SignUp Sucessfull" });

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
    return NextResponse.json({ message: "Internal Server Error", status: 500 });
  }
}
