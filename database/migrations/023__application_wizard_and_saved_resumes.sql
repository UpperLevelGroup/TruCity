-- V022__application_wizard_and_saved_resumes.sql
--
-- TruCity application wizard:
--   1. Employers configure application questions for each job.
--   2. Candidates save reusable CVs.
--   3. Applications retain answers and a snapshot of the selected CV.
--
-- Apply to the LOCAL trucity_local database first.
-- Do not run the local bootstrap schema against production.

BEGIN;

-- =========================================================
-- 1. SAVED CANDIDATE RESUMES
-- =========================================================

CREATE TABLE IF NOT EXISTS candidate_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    candidate_id UUID NOT NULL
        REFERENCES candidate_profiles(id)
        ON DELETE CASCADE,

    title VARCHAR(160) NOT NULL DEFAULT 'My CV',

    professional_title VARCHAR(180),

    -- Structured CV data: contact details, summary, experience,
    -- skills, education and other CV-builder fields.
    structured_data JSONB NOT NULL DEFAULT '{}'::jsonb,

    is_default BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT candidate_resumes_title_not_blank
        CHECK (length(trim(title)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_candidate_resumes_candidate
    ON candidate_resumes(candidate_id);

CREATE INDEX IF NOT EXISTS idx_candidate_resumes_candidate_updated
    ON candidate_resumes(candidate_id, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_candidate_resumes_default_per_candidate
    ON candidate_resumes(candidate_id)
    WHERE is_default = TRUE;


-- =========================================================
-- 2. EMPLOYER-DEFINED JOB APPLICATION QUESTIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS job_application_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    job_id UUID NOT NULL
        REFERENCES jobs(id)
        ON DELETE CASCADE,

    question_text TEXT NOT NULL,

    -- Supported types:
    -- TEXT, TEXTAREA, YES_NO, SINGLE_SELECT, MULTI_SELECT, NUMBER
    question_type VARCHAR(24) NOT NULL DEFAULT 'TEXT',

    is_required BOOLEAN NOT NULL DEFAULT TRUE,

    -- For SINGLE_SELECT and MULTI_SELECT:
    -- ["Option A", "Option B"]
    options JSONB NOT NULL DEFAULT '[]'::jsonb,

    display_order INTEGER NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT job_application_questions_text_not_blank
        CHECK (length(trim(question_text)) > 0),

    CONSTRAINT job_application_questions_type_valid
        CHECK (
            question_type IN (
                'TEXT',
                'TEXTAREA',
                'YES_NO',
                'SINGLE_SELECT',
                'MULTI_SELECT',
                'NUMBER'
            )
        )
);

CREATE INDEX IF NOT EXISTS idx_job_application_questions_job_order
    ON job_application_questions(job_id, display_order, created_at);


-- =========================================================
-- 3. LINK APPLICATION TO THE SELECTED RESUME
-- =========================================================

ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS selected_resume_id UUID
        REFERENCES candidate_resumes(id)
        ON DELETE SET NULL;

-- Snapshot of the CV exactly as it was submitted.
ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS resume_snapshot JSONB;


-- =========================================================
-- 4. APPLICATION ANSWERS
-- =========================================================

CREATE TABLE IF NOT EXISTS application_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    application_id UUID NOT NULL
        REFERENCES applications(id)
        ON DELETE CASCADE,

    -- Nullable so answers remain available if an employer later
    -- deletes a question. The text/type snapshots are retained.
    question_id UUID
        REFERENCES job_application_questions(id)
        ON DELETE SET NULL,

    question_text_snapshot TEXT NOT NULL,

    question_type_snapshot VARCHAR(24) NOT NULL DEFAULT 'TEXT',

    answer_text TEXT,

    -- Supports answers such as a multi-select list.
    answer_json JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT application_answers_question_type_valid
        CHECK (
            question_type_snapshot IN (
                'TEXT',
                'TEXTAREA',
                'YES_NO',
                'SINGLE_SELECT',
                'MULTI_SELECT',
                'NUMBER'
            )
        )
);

CREATE INDEX IF NOT EXISTS idx_application_answers_application
    ON application_answers(application_id);

CREATE INDEX IF NOT EXISTS idx_application_answers_question
    ON application_answers(question_id);

COMMIT;
