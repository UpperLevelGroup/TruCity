-- ============================================================
-- TRUCITY EMPLOYER PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS employer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    company_id UUID NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_employer_profiles_user_id
        UNIQUE (user_id),

    CONSTRAINT fk_employer_profiles_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_employer_profiles_user_id
    ON employer_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_employer_profiles_company_id
    ON employer_profiles(company_id);