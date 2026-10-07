-- ============================================================
-- Migration: 020 Company Onboarding
-- Project: TruCity
-- ============================================================


-- ============================================================
-- COMPANIES
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

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS representative_name VARCHAR(255);

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS representative_email VARCHAR(255);

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS representative_phone VARCHAR(255);

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS representative_role VARCHAR(255);

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
-- EMPLOYER PROFILES
-- ============================================================

ALTER TABLE employer_profiles
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP
    DEFAULT NOW();

ALTER TABLE employer_profiles
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
    DEFAULT NOW();


-- ============================================================
-- COMPANY BILLING PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS company_billing_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    company_id UUID NOT NULL,

    billing_contact_name VARCHAR(255),

    billing_contact_email VARCHAR(255),

    invoicing_address TEXT,

    agree_to_terms BOOLEAN NOT NULL DEFAULT FALSE,

    terms_agreed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_company_billing_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE
);


-- ============================================================
-- CONSTRAINTS / INDEXES
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
    uk_company_billing_profiles_company_id
ON company_billing_profiles(company_id);

CREATE INDEX IF NOT EXISTS
    idx_companies_registration_number
ON companies(registration_number);

CREATE INDEX IF NOT EXISTS
    idx_employer_profiles_company_id
ON employer_profiles(company_id);


-- ============================================================
-- EXISTING DATA
-- ============================================================

UPDATE companies
SET verification_status = 'NOT_VERIFIED'
WHERE verification_status IS NULL;

UPDATE companies
SET updated_at = created_at
WHERE updated_at IS NULL;

UPDATE employer_profiles
SET created_at = NOW()
WHERE created_at IS NULL;

UPDATE employer_profiles
SET updated_at = NOW()
WHERE updated_at IS NULL;