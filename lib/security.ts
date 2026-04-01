import { NextRequest, NextResponse } from "next/server";

// Security headers middleware
export function withSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
  );

  // Permissions Policy (Feature Policy)
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );

  // HSTS (HTTP Strict Transport Security)
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  return response;
}

// CORS handler
export function withCORS(response: NextResponse, req: NextRequest): NextResponse {
  const origin = req.headers.get("origin");

  // Only allow requests from same origin
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

// Sanitize error messages (don't leak sensitive info)
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
