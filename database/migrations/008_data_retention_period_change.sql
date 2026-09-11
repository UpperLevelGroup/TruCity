-- =====================================================
-- Migration: 008 Data Retention
-- Purpose: Change default retention from 10 years to 1 year
-- =====================================================

ALTER TABLE admin_settings
ALTER COLUMN data_retention_days SET DEFAULT 365;

UPDATE admin_settings
SET data_retention_days = 365;