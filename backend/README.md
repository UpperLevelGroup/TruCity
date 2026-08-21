# TruCity Backend API

Backend service for the TruCity a "Verified Talent Platform".

A secure enterprise recruitment platform that connects verified candidates with employers using:

- Credential verification
- Skill matching
- Recruitment workflows
- AI-powered compatibility scoring


---

# Technology Stack

## Backend

| Technology | Purpose |
|-|-|
| Java 21 | Programming Language |
| Spring Boot | REST API Framework |
| Spring Security | Authentication & Authorization |
| Spring Data JPA | Database Access |
| PostgreSQL | Database |
| Supabase | Cloud Database Platform |
| JWT | Authentication |
| Flyway | Database Migration |
| Swagger | API Documentation |
| Maven | Build Management |


---

# Project Structure

src/main/java/com/trucity
├── auth
├── user
├── candidate
├── employer
├── company
├── job
├── application
├── verification
├── matching
├── notification
├── analytics
├── admin
├── security
├── config
├── exception
└── common
---

# Database

Database: PostgreSQL
Provider: Supabase


Migration order: 001_initial_schema.sql 
               ├─002_authentication_schema.sql
               ├─003_user_roles_permissions
               ├─
               ├─
               ├─
               ├─
               ├─
               ├─
               ├─
               ├─


### Data Flow Diagram


<img width="1061" height="511" alt="supabase-schema-ismtusenmqwwbsawirle" src="https://github.com/user-attachments/assets/8704e781-7c50-46b7-b360-8ecb406cc6a4" />

<img width="1061" height="511" alt="supabase-schema-ismtusenmqwwbsawirle (1)" src="https://github.com/user-attachments/assets/7a123af0-c70d-4ffa-bec2-cf8eb59212df" />

<img width="1061" height="511" alt="supabase-schema-ismtusenmqwwbsawirle (2)" src="https://github.com/user-attachments/assets/c6b49ed5-6043-4053-ba13-1b541336e64c" />

<img width="1061" height="511" alt="supabase-schema-ismtusenmqwwbsawirle (3)" src="https://github.com/user-attachments/assets/47072aee-d681-4f2b-aec0-e76d476434a1" />

<img width="1061" height="511" alt="supabase-schema-ismtusenmqwwbsawirle (2)" src="https://github.com/user-attachments/assets/0c9974bd-66f3-4d64-8a78-5c48fcd222da" />

<img width="1061" height="511" alt="supabase-schema-ismtusenmqwwbsawirle (4)" src="https://github.com/user-attachments/assets/7e37aac3-2752-43b1-89b9-b8f3d2dc394f" />



---

# Environment Configuration

Create: .env

## Running Locally

Clone repository: it clone <repository>

Navigate: cd backend

Run: Linux/Mac: ./mvnw spring-boot:run

Windows: mvnw.cmd spring-boot:run

API Documentation

Swagger: http://localhost:8080/swagger-ui/index.html

OpenAPI: http://localhost:8080/v3/api-docs

## API Modules
Authentication
/api/v1/auth

## Endpoints:

POST /register
POST /login
POST /refresh
POST /logout
POST /verify-email
POST /forgot-password

Candidate
/api/v1/candidates

Features: Specialist
Profile
Skills
Qualifications
Experience
Documents
Employer
Verification
/api/v1/employers

Features: Company
Companies
Job postings
Applicants
Verification
/api/v1/verification

Features:

Qualification checks
Police clearance
Employment verification
Security Model

Roles: CANDIDATE, EMPLOYER,VERIFIER, ADMIN

Authentication: JWT Access Token + Refresh Token

## Development Workflow

Branches: main


develop


feature/*
bugfix/*

Pull requests require: Code review, Tests

# Documentation update

## Roadmap
### Phase 1

[x] Project Setup

[x] Database Foundation

[x] Authentication Schema

### Phase 2

[x] JWT Security

[ ] User Registration

[ ] Login

[ ] Role Management

### Phase 3

[ ] Candidate Profiles

[ ] Employer Profiles

[ ] Job Management

### Phase 4

[ ] Verification Engine

[ ] AI Matching

### Phase 5

[ ] Analytics

[ ] Administration

