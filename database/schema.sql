-- URL Analytics Schema for Slicly

-- Main users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Main URLs table
CREATE TABLE urls (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  short_code VARCHAR(255) UNIQUE NOT NULL,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics table - tracks individual clicks
CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer VARCHAR(500),
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_analytics_url_id ON analytics(url_id);
CREATE INDEX idx_analytics_clicked_at ON analytics(clicked_at);
CREATE INDEX idx_analytics_ip_address ON analytics(ip_address);
CREATE INDEX idx_urls_user_id ON urls(user_id);
CREATE INDEX idx_urls_short_code ON urls(short_code);
CREATE INDEX idx_users_email ON users(email);

-- Optional: Create a materialized view for daily stats
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

-- Create index on materialized view
CREATE INDEX idx_daily_stats_url_date ON daily_stats(url_id, date DESC);
