-- Candidate onboarding/profile setup fields.
-- This extends the candidate_profile_details table created by
-- 004_candidate_profile_details.sql without changing authentication
-- or the existing candidate_profiles table.

ALTER TABLE candidate_profile_details
    ADD COLUMN IF NOT EXISTS id_number TEXT,
    ADD COLUMN IF NOT EXISTS industry TEXT,
    ADD COLUMN IF NOT EXISTS experience_range TEXT,
    ADD COLUMN IF NOT EXISTS full_body_photo TEXT,
    ADD COLUMN IF NOT EXISTS intro_reel TEXT;
