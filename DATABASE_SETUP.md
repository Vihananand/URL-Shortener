# Database Setup Guide

## Creating the Analytics Table

Run these SQL commands in your Neon PostgreSQL database:

### 1. Create the analytics table
```sql
CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer VARCHAR(500),
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Create indexes for performance
```sql
CREATE INDEX idx_analytics_url_id ON analytics(url_id);
CREATE INDEX idx_analytics_clicked_at ON analytics(clicked_at);
CREATE INDEX idx_analytics_ip_address ON analytics(ip_address);
```

### 3. Optional: Create a materialized view for daily stats
```sql
CREATE MATERIALIZED VIEW daily_stats AS
SELECT
  u.id as url_id,
  u.short_code,
  DATE(a.clicked_at) as date,
  COUNT(*) as clicks,
  COUNT(DISTINCT a.ip_address) as unique_visitors
FROM urls u
LEFT JOIN analytics a ON u.id = a.url_id
GROUP BY u.id, u.short_code, DATE(a.clicked_at);

CREATE INDEX idx_daily_stats_url_date ON daily_stats(url_id, date DESC);
```

## Steps to Set Up

1. **Go to your Neon console** → https://console.neon.tech
2. **Open SQL Editor** for your project
3. **Paste the SQL** from above
4. **Run the queries**
5. **Restart your Next.js app** (`npm run dev`)

## Verify Installation

Run this query to check if the analytics table exists:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'analytics';
```

If you see the `analytics` table listed, you're all set! ✅

## What's Now Being Tracked

Every time someone clicks a shortened link:
- ✅ IP address
- ✅ Browser/device info (user agent)
- ✅ Referrer (where they came from)
- ✅ Exact timestamp
- ✅ Device type (Mobile/Desktop/Tablet)

## Accessing Analytics

Use the API: `GET /api/urls/:id/analytics`

Example with curl:
```bash
curl -H "Cookie: token=YOUR_JWT_TOKEN" \
  http://localhost:3000/api/urls/123/analytics
```

You'll get detailed analytics including:
- Total clicks
- Unique visitors
- Device breakdown
- Top referrers
- Hourly click distribution
- Recent 100 clicks

## Troubleshooting

**Q: "analytics table does not exist" error**
A: You need to run the CREATE TABLE command above in your Neon database.

**Q: Analytics not being recorded**
A: Make sure your `urls` table has an `id` column and the foreign key constraint is correct.

**Q: Analytics table is growing too large**
A: Consider adding a retention policy or archiving old data:
```sql
DELETE FROM analytics WHERE clicked_at < NOW() - INTERVAL '90 days';
```
