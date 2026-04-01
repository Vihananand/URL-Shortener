import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { createKeepAlive } from "@/lib/keepAlive";
import { withSecurityHeaders } from "@/lib/security";

// Initialize keep-alive tracker
const dbKeepAlive = createKeepAlive({ key: "database" });

export async function GET() {
  try {
    // Check if we should ping
    if (!dbKeepAlive.shouldPing()) {
      return withSecurityHeaders(
        NextResponse.json(
          { status: "skipped", message: "Keep-alive not needed yet" },
          { status: 200 }
        )
      );
    }

    // Simple ping query - very fast and lightweight
    const result = await pool.query("SELECT 1 as pong");

    if (result.rows.length > 0) {
      dbKeepAlive.recordPing();
      const status = dbKeepAlive.getStatus();

      return withSecurityHeaders(
        NextResponse.json(
          {
            status: "pong",
            message: "Database connection maintained",
            pingCount: status.pingCount,
            lastPing: status.lastPing,
          },
          { status: 200 }
        )
      );
    }

    throw new Error("Unexpected response from database");
  } catch (err) {
    dbKeepAlive.recordError();
    console.error("Keep-alive error:", err);

    return withSecurityHeaders(
      NextResponse.json(
        { status: "error", message: "Keep-alive check failed" },
        { status: 500 }
      )
    );
  }
}
