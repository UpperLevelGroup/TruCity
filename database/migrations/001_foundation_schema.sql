-- =====================================================
-- Migration: 001 Foundation Schema
-- Project: TruCity
-- Database: PostgreSQL (Supabase)
-- Supports: Users & authentication, Roles & permissions, Candidate profiles, Employers/Companies, Skills, Qualifications, Documents, Jobs, Applications, Verification tracking, Audit logs
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";



CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL
);


INSERT INTO roles(name)
VALUES
('CANDIDATE'),
('EMPLOYER'),
('VERIFIER'),
('ADMIN');



CREATE TABLE users (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    email VARCHAR(255)
        UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    first_name VARCHAR(100),

    last_name VARCHAR(100),

    phone VARCHAR(30),

    role_id UUID REFERENCES roles(id),

    is_verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);



CREATE TABLE audit_logs (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID REFERENCES users(id),

    action VARCHAR(100),

    description TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);



CREATE TABLE candidate_profiles (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID UNIQUE REFERENCES users(id)
    ON DELETE CASCADE,

    headline VARCHAR(255),

    bio TEXT,

    location VARCHAR(255),

    years_experience INTEGER DEFAULT 0,

    profile_completion INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW()

);



CREATE TABLE skills (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name VARCHAR(100) UNIQUE NOT NULL

);



CREATE TABLE candidate_skills (

    candidate_id UUID REFERENCES candidate_profiles(id)
    ON DELETE CASCADE,

    skill_id UUID REFERENCES skills(id)
    ON DELETE CASCADE,

    proficiency VARCHAR(50),

    years_used INTEGER,

    PRIMARY KEY(candidate_id,skill_id)

);




CREATE TABLE qualifications (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    candidate_id UUID REFERENCES candidate_profiles(id)
    ON DELETE CASCADE,

    institution VARCHAR(255),

    qualification_name VARCHAR(255),

    field_of_study VARCHAR(255),

    start_year INTEGER,

    completion_year INTEGER,

    verification_status VARCHAR(50)
    DEFAULT 'PENDING'

);




CREATE TABLE experience (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    candidate_id UUID REFERENCES candidate_profiles(id)
    ON DELETE CASCADE,

    company_name VARCHAR(255),

    job_title VARCHAR(255),

    description TEXT,

    start_date DATE,

    end_date DATE

);




CREATE TABLE documents (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    candidate_id UUID REFERENCES candidate_profiles(id),

    document_type VARCHAR(100),

    file_url TEXT,

    verification_status VARCHAR(50)
    DEFAULT 'PENDING',

    uploaded_at TIMESTAMP DEFAULT NOW()

);




CREATE TABLE companies (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name VARCHAR(255) NOT NULL,

    registration_number VARCHAR(100),

    industry VARCHAR(100),

    website VARCHAR(255),

    created_at TIMESTAMP DEFAULT NOW()

);




CREATE TABLE employer_profiles (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID REFERENCES users(id),

    company_id UUID REFERENCES companies(id)

);




CREATE TABLE jobs (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    company_id UUID REFERENCES companies(id),

    title VARCHAR(255),

    description TEXT,

    location VARCHAR(255),

    employment_type VARCHAR(50),

    salary_min NUMERIC,

    salary_max NUMERIC,

    status VARCHAR(50)
    DEFAULT 'OPEN',

    created_at TIMESTAMP DEFAULT NOW()

);




CREATE TABLE job_skills (

    job_id UUID REFERENCES jobs(id)
    ON DELETE CASCADE,

    skill_id UUID REFERENCES skills(id)
    ON DELETE CASCADE,

    required_level VARCHAR(50),

    PRIMARY KEY(job_id,skill_id)

);




CREATE TABLE applications (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    job_id UUID REFERENCES jobs(id),

    candidate_id UUID REFERENCES candidate_profiles(id),

    status VARCHAR(50)
    DEFAULT 'SUBMITTED',

    applied_at TIMESTAMP DEFAULT NOW()

);







CREATE TABLE verification_requests (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    candidate_id UUID REFERENCES candidate_profiles(id),

    verification_type VARCHAR(100),

    status VARCHAR(50)
    DEFAULT 'PENDING',

    submitted_at TIMESTAMP DEFAULT NOW()

);



CREATE TABLE verification_results (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    request_id UUID REFERENCES verification_requests(id),

    verifier_name VARCHAR(255),

    result VARCHAR(50),

    notes TEXT,

    verified_at TIMESTAMP

);





CREATE TABLE police_clearance (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    candidate_id UUID REFERENCES candidate_profiles(id),

    certificate_number VARCHAR(100),

    status VARCHAR(50),

    issue_date DATE,

    expiry_date DATE

);






CREATE INDEX idx_users_email
ON users(email);


CREATE INDEX idx_jobs_title
ON jobs(title);


CREATE INDEX idx_candidate_location
ON candidate_profiles(location);