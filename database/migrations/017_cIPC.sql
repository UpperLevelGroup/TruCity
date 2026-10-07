-- ============================================================
-- TruCity - CIPC Company Verification Fields
-- ============================================================
-- Adds CIPC verification data to the companies table.
-- Existing company records are preserved.
-- ============================================================

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30),
    ADD COLUMN IF NOT EXISTS verification_checked_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS cipc_enterprise_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS cipc_enterprise_status VARCHAR(100),
    ADD COLUMN IF NOT EXISTS cipc_registration_date VARCHAR(50),
    ADD COLUMN IF NOT EXISTS cipc_physical_address TEXT;