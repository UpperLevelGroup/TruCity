-- =============================================
-- Migration 005_users_enabled
-- Project: TruCity
-- Purpose: Add account enabled status
-- =============================================

ALTER TABLE users
ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT TRUE;