-- URL Shortener Database Setup Script
-- Run this in your Neon console or with psql

-- ============================================================================
-- 1. CREATE USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));

-- ============================================================================
-- 2. CREATE URLS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS urls (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  short_code VARCHAR(50) UNIQUE NOT NULL,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id);
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_urls_is_active ON urls(is_active);
CREATE INDEX IF NOT EXISTS idx_urls_created_at ON urls(created_at);

-- ============================================================================
-- 3. CREATE ANALYTICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_url_id ON analytics(url_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_ip_address ON analytics(ip_address);

-- ============================================================================
-- 4. CREATE MATERIALIZED VIEW FOR DAILY STATISTICS
-- ============================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_stats AS
SELECT
  u.id as url_id,
  u.short_code,
  DATE(a.created_at) as date,
  COUNT(*) as clicks,
  COUNT(DISTINCT a.ip_address) as unique_visitors
FROM urls u
LEFT JOIN analytics a ON u.id = a.url_id
GROUP BY u.id, u.short_code, DATE(a.created_at)
ORDER BY u.id, DATE(a.created_at) DESC;

-- Create indexes on materialized view
CREATE INDEX IF NOT EXISTS idx_daily_stats_url_id ON daily_stats(url_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

-- ============================================================================
-- 5. CREATE MATERIALIZED VIEW FOR USER STATISTICS
-- ============================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS user_stats AS
SELECT
  u.id as user_id,
  u.email,
  COUNT(DISTINCT urls.id) as total_urls,
  SUM(COALESCE(urls.clicks, 0)) as total_clicks,
  COUNT(DISTINCT CASE WHEN urls.is_active = true THEN urls.id END) as active_urls,
  MAX(analytics.created_at) as last_click_date
FROM users u
LEFT JOIN urls ON u.id = urls.user_id
LEFT JOIN analytics ON urls.id = analytics.url_id
GROUP BY u.id, u.email;

-- Create indexes on user stats view
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- ============================================================================
-- REFRESH MATERIALIZED VIEWS
-- ============================================================================
REFRESH MATERIALIZED VIEW daily_stats;
REFRESH MATERIALIZED VIEW user_stats;

-- ============================================================================
-- OPTIONAL: Create stored procedure to refresh views periodically
-- ============================================================================
-- Note: In production, use an external job scheduler or pg_cron extension
-- Run this periodically (e.g., every hour):
-- SELECT refresh_materialized_views();

CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFY SETUP
-- ============================================================================
-- Run these queries to verify everything is set up correctly:

-- Check tables exist
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check views exist
-- SELECT matviewname FROM pg_matviews WHERE schemaname = 'public';

-- Check indexes
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname;

-- Sample data queries:
-- SELECT COUNT(*) as total_users FROM users;
-- SELECT COUNT(*) as total_urls FROM urls;
-- SELECT COUNT(*) as total_clicks FROM analytics;
-- SELECT * FROM daily_stats LIMIT 10;
-- SELECT * FROM user_stats LIMIT 10;
