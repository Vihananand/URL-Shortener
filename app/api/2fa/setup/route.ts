import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import type { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { withSecurityHeaders, verifyOrigin } from "@/lib/security";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";
import { redis } from "@/lib/redis";
import { sendEmailOTP } from "@/lib/email";
import crypto from "crypto";
export async function POST(req: NextRequest) {
  try {
    if (!verifyOrigin(req)) {
      return withSecurityHeaders(NextResponse.json({ message: "Forbidden" }, { status: 403 }));
    }
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return withSecurityHeaders(NextResponse.json({ message: "Unauthorized" }, { status: 401 }));
    const decoded = verifyToken(token) as JwtPayload;
    if (!decoded || !decoded.email) {
      return withSecurityHeaders(NextResponse.json({ message: "Invalid Token" }, { status: 401 }));
    }
    const { method } = await req.json();
    if (method === "totp") {
      const secret = generateSecret();
      const otpauth = generateURI({ label: decoded.email, issuer: "URL Shortener", secret });
      const qrCodeUrl = await QRCode.toDataURL(otpauth);
      await redis.set(`totp_setup:${decoded.email}`, secret, { ex: 600 });
      return withSecurityHeaders(NextResponse.json({ secret, qrCodeUrl }));
    } 
    if (method === "email") {
      const otp = crypto.randomInt(100000, 999999).toString();
      await redis.set(`email_setup:${decoded.email}`, otp, { ex: 300 });
      const sent = await sendEmailOTP(decoded.email, otp);
      if (!sent) {
        return withSecurityHeaders(NextResponse.json({ message: "Failed to send email" }, { status: 500 }));
      }
      return withSecurityHeaders(NextResponse.json({ message: "OTP sent to email" }));
    }
    return withSecurityHeaders(NextResponse.json({ message: "Invalid method" }, { status: 400 }));
  } catch (err) {
    console.error("2FA Setup Error:", err);
    return withSecurityHeaders(NextResponse.json({ message: "Internal Server Error" }, { status: 500 }));
  }
}
