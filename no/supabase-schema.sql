-- ============================================
-- 📚 Oqool Learning System - Supabase Schema
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 📚 Patterns Table
-- ============================================
CREATE TABLE IF NOT EXISTS patterns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  task TEXT NOT NULL,
  architecture JSONB NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 100),
  user_id TEXT DEFAULT 'anonymous',
  upvotes INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  shared BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 🐛 Errors Table
-- ============================================
CREATE TABLE IF NOT EXISTS errors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  solution TEXT,
  severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 💡 Strategies Table
-- ============================================
CREATE TABLE IF NOT EXISTS strategies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  success_rate FLOAT DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
  applicable_to TEXT[] DEFAULT '{}',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 📊 User Stats Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_stats (
  user_id TEXT PRIMARY KEY,
  total_projects INTEGER DEFAULT 0,
  average_score FLOAT DEFAULT 0,
  patterns_shared INTEGER DEFAULT 0,
  patterns_downloaded INTEGER DEFAULT 0,
  improvement_rate FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_patterns_rating ON patterns(rating DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_upvotes ON patterns(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_created_at ON patterns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_task ON patterns USING gin(to_tsvector('english', task));
CREATE INDEX IF NOT EXISTS idx_errors_frequency ON errors(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_strategies_success_rate ON strategies(success_rate DESC);

-- ============================================
-- Functions for Auto-Update Timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patterns_updated_at BEFORE UPDATE ON patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_errors_updated_at BEFORE UPDATE ON errors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategies_updated_at BEFORE UPDATE ON strategies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Policies (allow read for everyone, write for everyone for now)
-- ============================================
CREATE POLICY "Allow public read access on patterns" ON patterns
  FOR SELECT USING (shared = true);

CREATE POLICY "Allow insert for everyone" ON patterns
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for everyone" ON patterns
  FOR UPDATE USING (true);

CREATE POLICY "Allow public read on errors" ON errors
  FOR SELECT USING (true);

CREATE POLICY "Allow insert on errors" ON errors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on strategies" ON strategies
  FOR SELECT USING (true);

CREATE POLICY "Allow insert on strategies" ON strategies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on user_stats" ON user_stats
  FOR SELECT USING (true);

CREATE POLICY "Allow insert on user_stats" ON user_stats
  FOR INSERT WITH CHECK (true);

-- ============================================
-- Insert Sample Data (Optional - للاختبار)
-- ============================================
INSERT INTO patterns (task, architecture, rating, user_id, upvotes) VALUES
('Build SaaS platform with auth and payments', '{"components": 12, "database": "PostgreSQL", "frontend": "React", "tags": ["saas", "auth", "payment"]}', 96, 'demo_user', 245),
('E-commerce with Stripe integration', '{"components": 8, "database": "MongoDB", "frontend": "Next.js", "tags": ["ecommerce", "payment", "stripe"]}', 94, 'demo_user', 189),
('Admin dashboard with analytics', '{"components": 6, "database": "PostgreSQL", "frontend": "Vue", "tags": ["dashboard", "analytics"]}', 92, 'demo_user', 156)
ON CONFLICT DO NOTHING;

INSERT INTO user_stats (user_id, total_projects, average_score, patterns_shared) VALUES
('demo_user', 15, 89, 3)
ON CONFLICT DO NOTHING;
