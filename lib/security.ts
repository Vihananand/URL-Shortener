import { NextRequest, NextResponse } from "next/server";
export function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  return response;
}
export function withCORS(response: NextResponse, req: NextRequest): NextResponse {
  const origin = req.headers.get("origin");
  if (origin === process.env.NEXT_PUBLIC_APP_URL || origin === "http://localhost:3000") {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }
  return response;
}
export function sanitizeErrorMessage(error: any): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("database") || message.includes("connection")) {
      return "Database error occurred";
    }
    if (message.includes("jwt")) {
      return "Authentication failed";
    }
  }
  return "An error occurred";
}
export function verifyOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  if (origin && origin === expectedOrigin) return true;
  if (origin && origin === "http://localhost:3000") return true; 
  if (referer && referer.startsWith(expectedOrigin)) return true;
  if (referer && referer.startsWith("http://localhost:3000")) return true;
  return false;
}
