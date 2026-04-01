import pool from "@/lib/db";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    // Find URL by short code
    const result = await pool.query(
      `SELECT id, original_url, is_active FROM urls WHERE short_code = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      redirect("/?error=link-not-found");
    }

    const url = result.rows[0];

    // Check if URL is active
    if (!url.is_active) {
      redirect("/?error=link-disabled");
    }

    // Get request headers for analytics
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      headersList.get("cf-connecting-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";
    const referrer = headersList.get("referer") || null;

    // Record analytics in parallel with click increment
    await Promise.all([
      // Update click count
      pool.query(`UPDATE urls SET clicks = clicks + 1 WHERE id = $1`, [url.id]),
      // Insert analytics record
      pool.query(
        `INSERT INTO analytics (url_id, ip_address, user_agent, referrer)
         VALUES ($1, $2, $3, $4)`,
        [url.id, ipAddress, userAgent, referrer]
      ),
    ]);

    // Redirect to original URL
    redirect(url.original_url);
  } catch (err) {
    console.error(err);
    redirect("/?error=redirect-failed");
  }
}
