-- =====================================================
-- Migration: 025 admin account management
-- Project: TruCity
-- Database: PostgreSQL (Supabase)
-- Supports: account removal
-- =====================================================

BEGIN;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS deletion_reason TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_users_deleted_at
    ON users (deleted_at);

CREATE INDEX IF NOT EXISTS idx_admin_user_flags_user_resolved
    ON admin_user_flags (user_id, resolved);

COMMIT;
