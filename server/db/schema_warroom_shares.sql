-- server/db/schema_warroom_shares.sql
-- Run once against the production PostgreSQL DB on Render.

CREATE TABLE IF NOT EXISTS warroom_shares (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_text TEXT        NOT NULL,
  match_context JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  expires_at    TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

CREATE INDEX IF NOT EXISTS idx_warroom_shares_expires ON warroom_shares (expires_at);
