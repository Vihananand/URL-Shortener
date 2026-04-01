# Analytics Implementation

## Overview
The analytics system tracks detailed click data for every shortened URL. Each click is recorded with:

- **IP Address** - For unique visitor tracking
- **User Agent** - For device/browser detection
- **Referrer** - Where the click came from
- **Timestamp** - When the click occurred

## Database Schema

### `analytics` table
```sql
CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),                    -- IPv4 or IPv6
  user_agent TEXT,                          -- Browser/device info
  referrer VARCHAR(500),                    -- Source URL
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_analytics_url_id ON analytics(url_id);
CREATE INDEX idx_analytics_clicked_at ON analytics(clicked_at);
CREATE INDEX idx_analytics_ip_address ON analytics(ip_address);
```

## API Endpoint

### GET `/api/urls/:id/analytics`
Requires authentication (JWT token).

**Response:**
```json
{
  "shortCode": "abc123",
  "summary": {
    "totalClicks": 1242,
    "uniqueVisitors": 487,
    "daysWithClicks": 15,
    "lastClicked": "2026-04-01T14:32:00Z",
    "firstClicked": "2026-03-17T09:15:00Z"
  },
  "deviceBreakdown": [
    { "deviceType": "Desktop", "count": 803 },
    { "deviceType": "Mobile", "count": 412 },
    { "deviceType": "Tablet", "count": 27 }
  ],
  "topReferrers": [
    { "referrer": "https://twitter.com", "count": 512 },
    { "referrer": "https://reddit.com", "count": 287 },
    { "referrer": "Direct", "count": 234 }
  ],
  "hourlyClicks": [
    { "hour": "2026-04-01T14:00:00Z", "count": 45 },
    { "hour": "2026-04-01T13:00:00Z", "count": 38 }
  ],
  "recentClicks": [
    {
      "id": 5234,
      "timestamp": "2026-04-01T14:32:45Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "referrer": "https://twitter.com/user/status/123",
      "deviceType": "Desktop"
    }
  ]
}
```

## Data Collection

### Per Click
When a user clicks on a shortened link (`GET /[slug]`):

1. **Request comes in** → `/api/[slug]`
2. **Headers captured**:
   - `x-forwarded-for` or `x-real-ip` → IP address
   - `user-agent` → Device/browser info
   - `referer` → Referring URL
3. **Analytics recorded** → Inserted into `analytics` table
4. **Click counter incremented** → Updated `urls.clicks`
5. **Redirect executed** → User sent to original URL

### Analytics Processing
The endpoint provides:

- **Total Click Count** - Sum of all clicks
- **Unique Visitors** - Count of distinct IP addresses
- **Days with Clicks** - How many unique days had clicks
- **Device Breakdown** - Desktop/Mobile/Tablet split
- **Top Referrers** - Most common sources of traffic
- **Hourly Clicks** - Last 24 hours click distribution
- **Recent Clicks** - Last 100 individual click records

## Privacy Considerations

⚠️ **Important**: The system stores:
- IP addresses (unless you modify the code)
- User agents (device fingerprinting data)
- Referrers (can contain sensitive URL data)

For GDPR compliance, you may want to:
1. Hash IP addresses
2. Anonymize user agents
3. Truncate referress
4. Add data retention policies
5. Implement user consent

## Performance Optimization

The schema includes indexes for:
- Fast lookups by URL (`idx_analytics_url_id`)
- Efficient time-range queries (`idx_analytics_clicked_at`)
- Unique visitor calculations (`idx_analytics_ip_address`)

For large-scale deployments, consider:
- Partitioning analytics table by date
- Using time-series database (TimescaleDB)
- Aggregating old data into summary tables

## Query Examples

```sql
-- Clicks per day for a URL
SELECT DATE(clicked_at) as date, COUNT(*) as clicks
FROM analytics
WHERE url_id = 1
GROUP BY DATE(clicked_at)
ORDER BY date DESC;

-- Top devices
SELECT
  CASE WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
       WHEN user_agent LIKE '%iPad%' THEN 'Tablet'
       ELSE 'Desktop' END as device,
  COUNT(*) as count
FROM analytics
WHERE url_id = 1
GROUP BY device;

-- Unique visitors per day
SELECT DATE(clicked_at) as date, COUNT(DISTINCT ip_address) as unique_visitors
FROM analytics
WHERE url_id = 1
GROUP BY DATE(clicked_at);
```

## Disabling Analytics

If you want to disable analytics collection, comment out the analytics insert in `/app/[slug]/route.ts`:

```typescript
// await pool.query(
//   `INSERT INTO analytics (url_id, ip_address, user_agent, referrer)
//    VALUES ($1, $2, $3, $4)`,
//   [url.id, ipAddress, userAgent, referrer]
// );
```

The click count will still increment, but detailed analytics won't be stored.
