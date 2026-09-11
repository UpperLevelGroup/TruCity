-- ============================================================
-- TruCity TEST / SEED DATA
-- PostgreSQL / Supabase
-- ============================================================
-- Test password for ALL seeded users:
-- Password123!
--
-- IMPORTANT:
-- This is development/test data only.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- 1. ROLE IDS
-- ============================================================

-- Make sure roles exist
INSERT INTO roles (name)
VALUES
    ('CANDIDATE'),
    ('EMPLOYER'),
    ('VERIFIER'),
    ('ADMIN')
ON CONFLICT (name) DO NOTHING;


-- ============================================================
-- 2. PERMISSIONS
-- ============================================================

INSERT INTO permissions (name, description)
VALUES
    ('PROFILE_READ', 'View profiles'),
    ('PROFILE_UPDATE', 'Update profile'),
    ('JOB_CREATE', 'Create job postings'),
    ('JOB_UPDATE', 'Update jobs'),
    ('JOB_DELETE', 'Delete jobs'),
    ('APPLICATION_VIEW', 'View applications'),
    ('APPLICATION_UPDATE', 'Update application status'),
    ('VERIFY_DOCUMENT', 'Verify candidate documents'),
    ('USER_MANAGE', 'Manage platform users'),
    ('REPORT_VIEW', 'View analytics reports')
ON CONFLICT (name) DO NOTHING;


-- ============================================================
-- 3. ROLE PERMISSIONS
-- ============================================================

INSERT INTO role_permissions (role_id, permission_id)

SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE
    (r.name = 'CANDIDATE'
        AND p.name IN (
            'PROFILE_READ',
            'PROFILE_UPDATE'
        ))

OR
    (r.name = 'EMPLOYER'
        AND p.name IN (
            'PROFILE_READ',
            'JOB_CREATE',
            'JOB_UPDATE',
            'APPLICATION_VIEW',
            'APPLICATION_UPDATE'
        ))

OR
    (r.name = 'VERIFIER'
        AND p.name IN (
            'VERIFY_DOCUMENT'
        ))

OR
    (r.name = 'ADMIN');

-- Avoid duplicates
-- The INSERT above can only be safely repeated if the combination
-- doesn't already exist.
-- Therefore remove duplicates if this seed is being rerun.

DELETE FROM role_permissions a
USING role_permissions b
WHERE a.ctid < b.ctid
AND a.role_id = b.role_id
AND a.permission_id = b.permission_id;


-- ============================================================
-- 4. USERS
-- ============================================================

-- All test users use:
-- Password123!

INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    role_id,
    is_verified
)
VALUES

(
    '11111111-1111-1111-1111-111111111111',
    'candidate@trucity.test',
    crypt('Password123!', gen_salt('bf')),
    'Thabo',
    'Mokoena',
    '+27821234567',
    (SELECT id FROM roles WHERE name = 'CANDIDATE'),
    TRUE
),

(
    '22222222-2222-2222-2222-222222222222',
    'candidate2@trucity.test',
    crypt('Password123!', gen_salt('bf')),
    'Lerato',
    'Dlamini',
    '+27829876543',
    (SELECT id FROM roles WHERE name = 'CANDIDATE'),
    TRUE
),

(
    '33333333-3333-3333-3333-333333333333',
    'employer@trucity.test',
    crypt('Password123!', gen_salt('bf')),
    'Michael',
    'Naidoo',
    '+27111234567',
    (SELECT id FROM roles WHERE name = 'EMPLOYER'),
    TRUE
),

(
    '44444444-4444-4444-4444-444444444444',
    'verifier@trucity.test',
    crypt('Password123!', gen_salt('bf')),
    'Sarah',
    'Mthembu',
    '+27117654321',
    (SELECT id FROM roles WHERE name = 'VERIFIER'),
    TRUE
),

(
    '55555555-5555-5555-5555-555555555555',
    'admin@trucity.test',
    crypt('Password123!', gen_salt('bf')),
    'James',
    'Pillay',
    '+27119876543',
    (SELECT id FROM roles WHERE name = 'ADMIN'),
    TRUE
)

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 5. USER_ROLES
-- ============================================================

INSERT INTO user_roles (user_id, role_id)

SELECT
    u.id,
    r.id
FROM users u
JOIN roles r
    ON r.name = CASE
        WHEN u.email IN (
            'candidate@trucity.test',
            'candidate2@trucity.test'
        ) THEN 'CANDIDATE'

        WHEN u.email = 'employer@trucity.test'
        THEN 'EMPLOYER'

        WHEN u.email = 'verifier@trucity.test'
        THEN 'VERIFIER'

        WHEN u.email = 'admin@trucity.test'
        THEN 'ADMIN'
    END

WHERE u.email IN (
    'candidate@trucity.test',
    'candidate2@trucity.test',
    'employer@trucity.test',
    'verifier@trucity.test',
    'admin@trucity.test'
)

ON CONFLICT (user_id, role_id) DO NOTHING;


-- ============================================================
-- 6. CANDIDATE PROFILES
-- ============================================================

INSERT INTO candidate_profiles (
    id,
    user_id,
    headline,
    bio,
    location,
    years_experience,
    profile_completion
)
VALUES

(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Full Stack Software Developer',
    'Software developer experienced in Java, Spring Boot, React and PostgreSQL. Passionate about building reliable systems.',
    'Johannesburg, Gauteng',
    3,
    90
),

(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'Junior Software Developer',
    'Junior developer focused on web applications, databases and modern software development.',
    'Pretoria, Gauteng',
    1,
    70
)

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 7. SKILLS
-- ============================================================

INSERT INTO skills (name)
VALUES
    ('Java'),
    ('Spring Boot'),
    ('React'),
    ('TypeScript'),
    ('JavaScript'),
    ('PostgreSQL'),
    ('SQL'),
    ('Docker'),
    ('AWS'),
    ('Git'),
    ('REST APIs'),
    ('Python'),
    ('C#'),
    ('Testing'),
    ('CI/CD')
ON CONFLICT (name) DO NOTHING;


-- ============================================================
-- 8. CANDIDATE SKILLS
-- ============================================================

INSERT INTO candidate_skills (
    candidate_id,
    skill_id,
    proficiency,
    years_used
)

SELECT
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    id,
    CASE name
        WHEN 'Java' THEN 'Advanced'
        WHEN 'Spring Boot' THEN 'Advanced'
        WHEN 'React' THEN 'Advanced'
        WHEN 'TypeScript' THEN 'Intermediate'
        WHEN 'PostgreSQL' THEN 'Advanced'
        WHEN 'SQL' THEN 'Advanced'
        WHEN 'Docker' THEN 'Intermediate'
        WHEN 'AWS' THEN 'Intermediate'
        WHEN 'Git' THEN 'Advanced'
        WHEN 'REST APIs' THEN 'Advanced'
        ELSE 'Intermediate'
    END,
    CASE name
        WHEN 'Java' THEN 3
        WHEN 'Spring Boot' THEN 2
        WHEN 'React' THEN 3
        WHEN 'PostgreSQL' THEN 3
        WHEN 'SQL' THEN 3
        ELSE 1
    END
FROM skills
WHERE name IN (
    'Java',
    'Spring Boot',
    'React',
    'TypeScript',
    'PostgreSQL',
    'SQL',
    'Docker',
    'AWS',
    'Git',
    'REST APIs'
)

ON CONFLICT (candidate_id, skill_id) DO NOTHING;


INSERT INTO candidate_skills (
    candidate_id,
    skill_id,
    proficiency,
    years_used
)

SELECT
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    id,
    CASE name
        WHEN 'JavaScript' THEN 'Intermediate'
        WHEN 'React' THEN 'Intermediate'
        WHEN 'SQL' THEN 'Intermediate'
        WHEN 'Git' THEN 'Intermediate'
        ELSE 'Beginner'
    END,
    1
FROM skills
WHERE name IN (
    'JavaScript',
    'React',
    'SQL',
    'Git',
    'Testing'
)

ON CONFLICT (candidate_id, skill_id) DO NOTHING;


-- ============================================================
-- 9. QUALIFICATIONS
-- ============================================================

INSERT INTO qualifications (
    id,
    candidate_id,
    institution,
    qualification_name,
    field_of_study,
    start_year,
    completion_year,
    verification_status
)
VALUES

(
    '10101010-1010-1010-1010-101010101010',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'University of Johannesburg',
    'Bachelor of Science',
    'Computer Science',
    2018,
    2021,
    'VERIFIED'
),

(
    '20202020-2020-2020-2020-202020202020',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Tshwane University of Technology',
    'Diploma in Information Technology',
    'Information Technology',
    2021,
    2023,
    'PENDING'
);


-- ============================================================
-- 10. EXPERIENCE
-- ============================================================

INSERT INTO experience (
    id,
    candidate_id,
    company_name,
    job_title,
    description,
    start_date,
    end_date
)
VALUES

(
    '30303030-3030-3030-3030-303030303030',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Tech Solutions SA',
    'Software Developer',
    'Developed REST APIs, database systems and React applications.',
    '2022-01-10',
    NULL
),

(
    '40404040-4040-4040-4040-404040404040',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Digital Innovations',
    'Junior Developer',
    'Built frontend applications and assisted with SQL database development.',
    '2023-02-01',
    '2024-12-31'
);


-- ============================================================
-- 11. DOCUMENTS
-- ============================================================

INSERT INTO documents (
    id,
    candidate_id,
    document_type,
    file_url,
    verification_status
)
VALUES

(
    '50505050-5050-5050-5050-505050505050',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'ID_DOCUMENT',
    'https://example.com/documents/thabo-id.pdf',
    'VERIFIED'
),

(
    '60606060-6060-6060-6060-606060606060',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'DEGREE_CERTIFICATE',
    'https://example.com/documents/thabo-degree.pdf',
    'VERIFIED'
),

(
    '70707070-7070-7070-7070-707070707070',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'DEGREE_CERTIFICATE',
    'https://example.com/documents/lerato-degree.pdf',
    'PENDING'
);


-- ============================================================
-- 12. COMPANIES
-- ============================================================

INSERT INTO companies (
    id,
    name,
    registration_number,
    industry,
    website
)
VALUES

(
    '88888888-8888-8888-8888-888888888888',
    'TechCorp South Africa',
    '2020/123456/07',
    'Information Technology',
    'https://example.com'
),

(
    '99999999-9999-9999-9999-999999999999',
    'Digital Finance Solutions',
    '2019/987654/07',
    'Financial Technology',
    'https://example.com'
);


-- ============================================================
-- 13. EMPLOYER PROFILE
-- ============================================================

INSERT INTO employer_profiles (
    id,
    user_id,
    company_id
)
VALUES

(
    '12121212-1212-1212-1212-121212121212',
    '33333333-3333-3333-3333-333333333333',
    '88888888-8888-8888-8888-888888888888'
)

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 14. JOBS
-- ============================================================

INSERT INTO jobs (
    id,
    company_id,
    title,
    description,
    location,
    employment_type,
    salary_min,
    salary_max,
    status
)
VALUES

(
    '13131313-1313-1313-1313-131313131313',
    '88888888-8888-8888-8888-888888888888',
    'Junior Software Developer',
    'Join our development team and work on modern web applications and REST APIs.',
    'Johannesburg, Gauteng',
    'FULL_TIME',
    18000,
    28000,
    'OPEN'
),

(
    '14141414-1414-1414-1414-141414141414',
    '88888888-8888-8888-8888-888888888888',
    'Java Spring Boot Developer',
    'Develop scalable backend services using Java and Spring Boot.',
    'Sandton, Gauteng',
    'FULL_TIME',
    30000,
    45000,
    'OPEN'
),

(
    '15151515-1515-1515-1515-151515151515',
    '99999999-9999-9999-9999-999999999999',
    'Graduate Software Engineer',
    'Graduate opportunity for an enthusiastic software engineer.',
    'Pretoria, Gauteng',
    'GRADUATE',
    15000,
    22000,
    'OPEN'
),

(
    '16161616-1616-1616-1616-161616161616',
    '99999999-9999-9999-9999-999999999999',
    'Full Stack Developer',
    'Build and maintain full stack enterprise applications.',
    'Johannesburg, Gauteng',
    'FULL_TIME',
    28000,
    42000,
    'CLOSED'
);


-- ============================================================
-- 15. JOB SKILLS
-- ============================================================

INSERT INTO job_skills (
    job_id,
    skill_id,
    required_level
)

SELECT
    '13131313-1313-1313-1313-131313131313',
    id,
    CASE name
        WHEN 'JavaScript' THEN 'Intermediate'
        WHEN 'React' THEN 'Intermediate'
        WHEN 'Git' THEN 'Intermediate'
        WHEN 'SQL' THEN 'Intermediate'
        ELSE 'Beginner'
    END
FROM skills
WHERE name IN (
    'JavaScript',
    'React',
    'Git',
    'SQL'
)

ON CONFLICT (job_id, skill_id) DO NOTHING;


INSERT INTO job_skills (
    job_id,
    skill_id,
    required_level
)

SELECT
    '14141414-1414-1414-1414-141414141414',
    id,
    'Advanced'
FROM skills
WHERE name IN (
    'Java',
    'Spring Boot',
    'PostgreSQL',
    'REST APIs',
    'Git'
)

ON CONFLICT (job_id, skill_id) DO NOTHING;


INSERT INTO job_skills (
    job_id,
    skill_id,
    required_level
)

SELECT
    '15151515-1515-1515-1515-151515151515',
    id,
    'Beginner'
FROM skills
WHERE name IN (
    'Java',
    'SQL',
    'Git'
)

ON CONFLICT (job_id, skill_id) DO NOTHING;


-- ============================================================
-- 16. APPLICATIONS
-- ============================================================

INSERT INTO applications (
    id,
    job_id,
    candidate_id,
    status
)
VALUES

(
    '17171717-1717-1717-1717-171717171717',
    '13131313-1313-1313-1313-131313131313',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'SUBMITTED'
),

(
    '18181818-1818-1818-1818-181818181818',
    '14141414-1414-1414-1414-141414141414',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'SHORTLISTED'
),

(
    '19191919-1919-1919-1919-191919191919',
    '15151515-1515-1515-1515-151515151515',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'SUBMITTED'
);


-- ============================================================
-- 17. VERIFICATION REQUESTS
-- ============================================================

INSERT INTO verification_requests (
    id,
    candidate_id,
    verification_type,
    status
)
VALUES

(
    '21212121-2121-2121-2121-212121212121',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'IDENTITY',
    'COMPLETED'
),

(
    '22222222-aaaa-bbbb-cccc-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'QUALIFICATION',
    'COMPLETED'
),

(
    '23232323-2323-2323-2323-232323232323',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'QUALIFICATION',
    'PENDING'
),

(
    '24242424-2424-2424-2424-242424242424',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'IDENTITY',
    'PENDING'
);


-- ============================================================
-- 18. VERIFICATION RESULTS
-- ============================================================

INSERT INTO verification_results (
    id,
    request_id,
    verifier_name,
    result,
    notes,
    verified_at
)
VALUES

(
    '25252525-2525-2525-2525-252525252525',
    '21212121-2121-2121-2121-212121212121',
    'Sarah Mthembu',
    'VERIFIED',
    'Identity document successfully verified.',
    NOW() - INTERVAL '5 days'
),

(
    '26262626-2626-2626-2626-262626262626',
    '22222222-aaaa-bbbb-cccc-222222222222',
    'Sarah Mthembu',
    'VERIFIED',
    'Qualification confirmed with institution.',
    NOW() - INTERVAL '3 days'
);


-- ============================================================
-- 19. POLICE CLEARANCE
-- ============================================================

INSERT INTO police_clearance (
    id,
    candidate_id,
    certificate_number,
    status,
    issue_date,
    expiry_date
)
VALUES

(
    '27272727-2727-2727-2727-272727272727',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'PCC-2026-001234',
    'VALID',
    '2026-01-15',
    '2027-01-15'
),

(
    '28282828-2828-2828-2828-282828282828',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'PCC-2026-005678',
    'VALID',
    '2026-03-20',
    '2027-03-20'
);


-- ============================================================
-- 20. AUDIT LOGS
-- ============================================================

INSERT INTO audit_logs (
    user_id,
    action,
    description
)
VALUES

(
    '11111111-1111-1111-1111-111111111111',
    'PROFILE_CREATED',
    'Candidate profile created.'
),

(
    '33333333-3333-3333-3333-333333333333',
    'JOB_CREATED',
    'Employer created a new job posting.'
),

(
    '44444444-4444-4444-4444-444444444444',
    'DOCUMENT_VERIFIED',
    'Candidate identity document verified.'
),

(
    '55555555-5555-5555-5555-555555555555',
    'USER_MANAGEMENT',
    'Administrator accessed user management.'
);


-- ============================================================
-- 21. LOGIN HISTORY
-- ============================================================

INSERT INTO login_history (
    user_id,
    login_successful,
    ip_address
)
VALUES

(
    '11111111-1111-1111-1111-111111111111',
    TRUE,
    '127.0.0.1'
),

(
    '33333333-3333-3333-3333-333333333333',
    TRUE,
    '127.0.0.1'
),

(
    '44444444-4444-4444-4444-444444444444',
    TRUE,
    '127.0.0.1'
),

(
    '11111111-1111-1111-1111-111111111111',
    FALSE,
    '127.0.0.1'
);


-- ============================================================
-- 22. USER SESSIONS
-- ============================================================

INSERT INTO user_sessions (
    user_id,
    ip_address,
    user_agent,
    active
)
VALUES

(
    '11111111-1111-1111-1111-111111111111',
    '127.0.0.1',
    'Mozilla/5.0 TruCity Test Browser',
    TRUE
),

(
    '33333333-3333-3333-3333-333333333333',
    '127.0.0.1',
    'Mozilla/5.0 TruCity Test Browser',
    TRUE
);


-- ============================================================
-- 23. MFA SETTINGS
-- ============================================================

INSERT INTO user_mfa_settings (
    user_id,
    enabled
)
VALUES

(
    '11111111-1111-1111-1111-111111111111',
    FALSE
),

(
    '33333333-3333-3333-3333-333333333333',
    FALSE
),

(
    '44444444-4444-4444-4444-444444444444',
    TRUE
)

ON CONFLICT (user_id) DO NOTHING;


-- ============================================================
-- 24. SECURITY EVENTS
-- ============================================================

INSERT INTO security_events (
    user_id,
    event_type,
    description,
    severity
)
VALUES

(
    '11111111-1111-1111-1111-111111111111',
    'LOGIN_SUCCESS',
    'Successful candidate login.',
    'LOW'
),

(
    '11111111-1111-1111-1111-111111111111',
    'LOGIN_FAILURE',
    'Failed login attempt.',
    'MEDIUM'
),

(
    '44444444-4444-4444-4444-444444444444',
    'MFA_ENABLED',
    'Verifier enabled multi-factor authentication.',
    'LOW'
);


-- ============================================================
-- 25. VERIFICATION TOKEN
-- ============================================================

INSERT INTO email_verification_tokens (
    user_id,
    token,
    expires_at,
    used
)
VALUES
(
    '22222222-2222-2222-2222-222222222222',
    'TEST-EMAIL-VERIFICATION-TOKEN-001',
    NOW() + INTERVAL '24 hours',
    FALSE
)
ON CONFLICT (token) DO NOTHING;


-- ============================================================
-- 26. PASSWORD RESET TOKEN
-- ============================================================

INSERT INTO password_reset_tokens (
    user_id,
    token,
    expires_at,
    used
)
VALUES
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'TEST-PASSWORD-RESET-TOKEN-001',
    NOW() + INTERVAL '1 hour',
    FALSE
)
ON CONFLICT (token) DO NOTHING;


-- ============================================================
-- 27. REFRESH TOKEN
-- ============================================================

INSERT INTO refresh_tokens (
    user_id,
    token,
    expiry_date,
    revoked
)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'TEST-REFRESH-TOKEN-CANDIDATE-001',
    NOW() + INTERVAL '30 days',
    FALSE
)
ON CONFLICT (token) DO NOTHING;


-- ============================================================
-- 28. FINAL COUNTS
-- ============================================================

SELECT 'users' AS table_name, COUNT(*) AS records FROM users
UNION ALL
SELECT 'candidate_profiles', COUNT(*) FROM candidate_profiles
UNION ALL
SELECT 'skills', COUNT(*) FROM skills
UNION ALL
SELECT 'qualifications', COUNT(*) FROM qualifications
UNION ALL
SELECT 'experience', COUNT(*) FROM experience
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'applications', COUNT(*) FROM applications
UNION ALL
SELECT 'verification_requests', COUNT(*) FROM verification_requests
UNION ALL
SELECT 'verification_results', COUNT(*) FROM verification_results
UNION ALL
SELECT 'police_clearance', COUNT(*) FROM police_clearance
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'login_history', COUNT(*) FROM login_history
UNION ALL
SELECT 'security_events', COUNT(*) FROM security_events
ORDER BY table_name;