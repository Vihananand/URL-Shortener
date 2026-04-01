import { NextResponse } from "next/server";

export async function POST() {
  try {
    const res = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

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
