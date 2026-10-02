-- Candidate profile data that is owned by the authenticated candidate.
-- This does not alter existing authentication or candidate_profile tables.

CREATE TABLE IF NOT EXISTS candidate_profile_details (
    candidate_id UUID PRIMARY KEY
        REFERENCES candidate_profiles(id)
        ON DELETE CASCADE,

    face_photo TEXT,

    skills TEXT NOT NULL DEFAULT '[]',

    gallery_images TEXT NOT NULL DEFAULT '[]',

    documents TEXT NOT NULL DEFAULT '[]',

    projects TEXT NOT NULL DEFAULT '[]',

    reel_meta TEXT,

    preferences TEXT NOT NULL DEFAULT '{"availability":"full-time"}',

    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_profile_details_updated_at
    ON candidate_profile_details(updated_at);
