-- =====================================================
-- Migration: 007 Admin Settings
-- Project: TruCity
-- Purpose: Persistent platform administration settings
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Platform
    platform_name VARCHAR(255) NOT NULL DEFAULT 'TruCity',
    platform_description TEXT,
    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    maintenance_message TEXT,

    -- Users & Registration
    candidate_registration_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    employer_registration_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    require_email_verification BOOLEAN NOT NULL DEFAULT TRUE,
    auto_enable_new_accounts BOOLEAN NOT NULL DEFAULT TRUE,

    -- Jobs
    job_creation_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    require_job_approval BOOLEAN NOT NULL DEFAULT FALSE,
    allow_published_job_editing BOOLEAN NOT NULL DEFAULT TRUE,
    allow_job_closing BOOLEAN NOT NULL DEFAULT TRUE,

    -- Verification
    candidate_verification_required BOOLEAN NOT NULL DEFAULT FALSE,
    document_verification_required BOOLEAN NOT NULL DEFAULT TRUE,
    verifier_workflow_enabled BOOLEAN NOT NULL DEFAULT TRUE,

    -- Applications
    applications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    allow_multiple_applications BOOLEAN NOT NULL DEFAULT TRUE,
    allow_application_withdrawal BOOLEAN NOT NULL DEFAULT TRUE,

    -- Notifications
    email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    application_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    verification_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    job_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,

    -- Security
    session_timeout_minutes INTEGER NOT NULL DEFAULT 1440,
    max_login_attempts INTEGER NOT NULL DEFAULT 5,
    require_mfa_for_admins BOOLEAN NOT NULL DEFAULT FALSE,

    -- Privacy & Data
    data_retention_days INTEGER NOT NULL DEFAULT 3650,

    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

INSERT INTO admin_settings (
    platform_name,
    platform_description
)
SELECT
    'TruCity',
    'Trusted employment and verification platform'
WHERE NOT EXISTS (
    SELECT 1 FROM admin_settings
);

CREATE INDEX IF NOT EXISTS idx_admin_settings_updated_at
    ON admin_settings(updated_at);