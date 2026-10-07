-- ============================================================
-- 018_cipc_company_verification.sql
-- TruCity - CIPC Company Verification
-- ============================================================

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30),
    ADD COLUMN IF NOT EXISTS verification_checked_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS cipc_enterprise_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS cipc_enterprise_status VARCHAR(100),
    ADD COLUMN IF NOT EXISTS cipc_registration_date VARCHAR(50),
    ADD COLUMN IF NOT EXISTS cipc_physical_address TEXT;

-- Existing companies have not yet gone through CIPC verification.
UPDATE companies
SET verification_status = 'NOT_VERIFIED'
WHERE verification_status IS NULL;

ALTER TABLE companies
    ALTER COLUMN verification_status SET DEFAULT 'NOT_VERIFIED',
    ALTER COLUMN verification_status SET NOT NULL;