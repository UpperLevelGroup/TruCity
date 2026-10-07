-- ============================================================
-- Migration: 021 Company Onboarding
-- TruCity
--
-- CIPC verification is intentionally NOT performed.
-- New companies are stored as NOT_VERIFIED.
-- ============================================================


-- ============================================================
-- COMPANY INFORMATION
-- ============================================================

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS trading_name VARCHAR(255);

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS region VARCHAR(255);

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS registered_address TEXT;

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS company_email VARCHAR(255);

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS phone VARCHAR(50);


-- ============================================================
-- COMPANY REPRESENTATIVE
-- ============================================================

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS representative_name VARCHAR(255);

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS representative_email VARCHAR(255);

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS representative_phone VARCHAR(50);

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS representative_role VARCHAR(255);


-- ============================================================
-- VERIFICATION
-- ============================================================

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50)
    DEFAULT 'NOT_VERIFIED';

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS verification_checked_at TIMESTAMP;

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS cipc_enterprise_name VARCHAR(255);

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS cipc_enterprise_status VARCHAR(100);

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS cipc_registration_date VARCHAR(100);

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS cipc_physical_address TEXT;


-- ============================================================
-- EMPLOYER PROFILE TIMESTAMPS
-- ============================================================

ALTER TABLE employer_profiles
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP
    DEFAULT NOW();

ALTER TABLE employer_profiles
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
    DEFAULT NOW();


-- ============================================================
-- EXISTING DATA SAFETY
-- ============================================================

UPDATE companies
SET verification_status = 'NOT_VERIFIED'
WHERE verification_status IS NULL;

UPDATE companies
SET updated_at = created_at
WHERE updated_at IS NULL;


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS
    idx_companies_registration_number
ON companies(registration_number);

CREATE INDEX IF NOT EXISTS
    idx_employer_profiles_company_id
ON employer_profiles(company_id);
