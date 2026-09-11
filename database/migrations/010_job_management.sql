/*
|--------------------------------------------------------------------------
| TruCity — Job Management Expansion
|--------------------------------------------------------------------------
|
| Adds the information required for a complete employer job listing.
|
| Existing jobs are preserved.
|
|--------------------------------------------------------------------------
*/

ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS department VARCHAR(100);

ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS workplace_type VARCHAR(50);

ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS salary_currency VARCHAR(10) DEFAULT 'ZAR';

ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS salary_negotiable BOOLEAN DEFAULT FALSE;

ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS qualifications TEXT;

ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS experience_required TEXT;

ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS responsibilities TEXT;

ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS benefits TEXT;

ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS openings INTEGER DEFAULT 1;

ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS application_deadline DATE;


/*
|--------------------------------------------------------------------------
| Defaults for existing records
|--------------------------------------------------------------------------
*/

UPDATE jobs
SET salary_currency = 'ZAR'
WHERE salary_currency IS NULL;

UPDATE jobs
SET salary_negotiable = FALSE
WHERE salary_negotiable IS NULL;

UPDATE jobs
SET openings = 1
WHERE openings IS NULL OR openings < 1;


/*
|--------------------------------------------------------------------------
| Existing migration used OPEN as the original default status.
| The current application uses ACTIVE.
|--------------------------------------------------------------------------
*/

UPDATE jobs
SET status = 'ACTIVE'
WHERE UPPER(status) = 'OPEN';


/*
|--------------------------------------------------------------------------
| Helpful indexes
|--------------------------------------------------------------------------
*/

CREATE INDEX IF NOT EXISTS idx_jobs_company_id
    ON jobs(company_id);

CREATE INDEX IF NOT EXISTS idx_jobs_status
    ON jobs(status);

CREATE INDEX IF NOT EXISTS idx_jobs_created_at
    ON jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_skills_job_id
    ON job_skills(job_id);