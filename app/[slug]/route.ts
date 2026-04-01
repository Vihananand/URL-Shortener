import pool from "@/lib/db";
import { redirect } from "next/navigation";

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
      `SELECT original_url, is_active FROM urls WHERE short_code = $1`,
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

    // Increment click count
    await pool.query(
      `UPDATE urls SET clicks = clicks + 1 WHERE short_code = $1`,
      [slug]
    );

    // Redirect to original URL
    redirect(url.original_url);
  } catch (err) {
    console.error(err);
    redirect("/?error=redirect-failed");
  }
}
