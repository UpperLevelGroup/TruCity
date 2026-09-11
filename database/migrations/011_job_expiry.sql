-- TruCity job expiry support
-- Run this once against the TruCity PostgreSQL/Supabase database
-- if application_deadline is not already present on jobs.

ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS application_deadline DATE;

CREATE INDEX IF NOT EXISTS idx_jobs_application_deadline
    ON jobs(application_deadline);

-- Immediately apply the rule to posts that have already expired.
UPDATE applications a
SET status = 'REJECTED'
FROM jobs j
WHERE j.id = a.job_id
  AND j.application_deadline IS NOT NULL
  AND j.application_deadline < CURRENT_DATE
  AND UPPER(COALESCE(a.status, '')) <> 'REJECTED';

UPDATE jobs
SET status = 'CLOSED'
WHERE application_deadline IS NOT NULL
  AND application_deadline < CURRENT_DATE
  AND UPPER(COALESCE(status, '')) <> 'CLOSED';
