-- =====================================================
-- Migration: 004 Company Fields
-- =====================================================

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS location VARCHAR(255);

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE;