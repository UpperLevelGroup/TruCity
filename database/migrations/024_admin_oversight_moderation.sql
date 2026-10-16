-- =====================================================
-- Migration: 024 admin moderation and conversation controls.
-- Project: TruCity
-- Database: PostgreSQL (Supabase)
-- Supports: admin moderation and conversation controls.
-- =====================================================

-- TruCity 
ALTER TABLE companies ADD COLUMN IF NOT EXISTS verification_notes TEXT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS moderation_previous_status VARCHAR(30) NULL;
ALTER TABLE company_hub_content ADD COLUMN IF NOT EXISTS moderation_previous_status VARCHAR(30) NULL;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS terminated_at TIMESTAMP NULL;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS termination_reason VARCHAR(500) NULL;
CREATE TABLE IF NOT EXISTS admin_user_flags (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_admin_user_flags_user_id ON admin_user_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
