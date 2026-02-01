-- Migration: Add GitHub contributions tables
-- Created: 2026-02-01

-- Create github_contributions table
CREATE TABLE IF NOT EXISTS github_contributions (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    contribution_count INTEGER NOT NULL DEFAULT 0,
    contribution_level INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_github_contributions_date ON github_contributions(date DESC);

-- Create github_stats table
CREATE TABLE IF NOT EXISTS github_stats (
    id SERIAL PRIMARY KEY,
    stat_key VARCHAR(50) NOT NULL UNIQUE,
    stat_value INTEGER NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for updated_at auto-update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_github_contributions_updated_at BEFORE UPDATE
    ON github_contributions FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_stats_updated_at BEFORE UPDATE
    ON github_stats FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
