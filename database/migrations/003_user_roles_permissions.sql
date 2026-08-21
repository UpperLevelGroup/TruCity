-- =============================================
-- Migration 003_user_roles_permissions
-- Project: TruCity
-- Database: PostgreSQL (Supabase)
-- Supports: Role Based Access Control
-- =============================================


CREATE TABLE permissions (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name VARCHAR(100)
        UNIQUE NOT NULL,

    description TEXT

);




CREATE TABLE role_permissions (

    role_id UUID
        REFERENCES roles(id)
        ON DELETE CASCADE,


    permission_id UUID
        REFERENCES permissions(id)
        ON DELETE CASCADE,


    PRIMARY KEY(role_id, permission_id)

);




INSERT INTO permissions(name,description)
VALUES

('PROFILE_READ',
'View profiles'),

('PROFILE_UPDATE',
'Update profile'),

('JOB_CREATE',
'Create job postings'),

('JOB_UPDATE',
'Update jobs'),

('JOB_DELETE',
'Delete jobs'),

('APPLICATION_VIEW',
'View applications'),

('APPLICATION_UPDATE',
'Update application status'),

('VERIFY_DOCUMENT',
'Verify candidate documents'),

('USER_MANAGE',
'Manage platform users'),

('REPORT_VIEW',
'View analytics reports');




INSERT INTO role_permissions

SELECT

r.id,

p.id

FROM roles r, permissions p

WHERE r.name='CANDIDATE'

AND p.name IN
(
'PROFILE_READ',
'PROFILE_UPDATE'
);



INSERT INTO role_permissions

SELECT

r.id,

p.id

FROM roles r, permissions p

WHERE r.name='EMPLOYER'

AND p.name IN
(
'PROFILE_READ',
'JOB_CREATE',
'JOB_UPDATE',
'APPLICATION_VIEW',
'APPLICATION_UPDATE'
);



INSERT INTO role_permissions

SELECT

r.id,

p.id

FROM roles r, permissions p

WHERE r.name='VERIFIER'

AND p.name IN
(
'VERIFY_DOCUMENT'
);


INSERT INTO role_permissions

SELECT

r.id,

p.id

FROM roles r, permissions p

WHERE r.name='ADMIN';