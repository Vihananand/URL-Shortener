import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const decode = verifyToken(token);
  if (!decode) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: decode });
}
