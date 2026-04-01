# Database Setup Guide

## Overview
This document explains how to set up the PostgreSQL database for the URL Shortener application.

## Prerequisites
- Neon PostgreSQL database account (https://neon.tech)
- Access to Neon console or psql CLI
- Environment variables configured

## Tables

### 1. Users Table
Stores user account information.
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. URLs Table
Stores shortened URLs created by users.
```sql
CREATE TABLE urls (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  short_code VARCHAR(50) UNIQUE NOT NULL,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Analytics Table
Tracks every click on shortened URLs.
```sql
CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key:** The correct column is `created_at` (NOT `clicked_at`)

## Setup Instructions

### Quick Setup (Copy & Paste)
Go to https://console.neon.tech → SQL Editor and paste the full SQL from `/database/setup.sql`

### Manual Setup
Run each step in Neon SQL Editor:

```sql
-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create URLs table
CREATE TABLE IF NOT EXISTS urls (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  short_code VARCHAR(50) UNIQUE NOT NULL,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id);
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_analytics_url_id ON analytics(url_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

-- 5. Create materialized view for daily stats
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

CREATE INDEX IF NOT EXISTS idx_daily_stats_url_id ON daily_stats(url_id);

-- 6. Create user stats view
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

-- 7. Refresh views
REFRESH MATERIALIZED VIEW daily_stats;
REFRESH MATERIALIZED VIEW user_stats;
```

## Verification

```sql
-- Verify tables created
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Verify views
SELECT matviewname FROM pg_matviews WHERE schemaname = 'public';

-- Check row counts
SELECT 'users' as table_name, COUNT(*) as rows FROM users
UNION ALL SELECT 'urls', COUNT(*) FROM urls
UNION ALL SELECT 'analytics', COUNT(*) FROM analytics;
```

## See Also
- `/database/setup.sql` - Complete SQL setup script
- `/SECURITY.md` - Security documentation
- `/app/api/stats/route.ts` - Daily stats API endpoint
