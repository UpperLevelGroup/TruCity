-- =====================================================
-- Migration: 002 Authentication & Security Schema
-- Project: TruCity
-- Database: PostgreSQL (Supabase)
-- Supports: JWT authentication, Refresh tokens, Email verification, Password reset, Login tracking, Account security, Future enterprise auditing
-- =====================================================



CREATE TABLE email_verification_tokens (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    token VARCHAR(255) UNIQUE NOT NULL,

    expires_at TIMESTAMP NOT NULL,

    used BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW()

);




CREATE TABLE password_reset_tokens (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    token VARCHAR(255) UNIQUE NOT NULL,

    expires_at TIMESTAMP NOT NULL,

    used BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW()

);




CREATE TABLE refresh_tokens (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,


    token TEXT UNIQUE NOT NULL,


    expiry_date TIMESTAMP NOT NULL,


    revoked BOOLEAN DEFAULT FALSE,


    created_at TIMESTAMP DEFAULT NOW()

);




CREATE TABLE user_sessions (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),


    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,


    ip_address VARCHAR(100),


    user_agent TEXT,


    login_time TIMESTAMP DEFAULT NOW(),


    logout_time TIMESTAMP,


    active BOOLEAN DEFAULT TRUE

);




CREATE TABLE login_history (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),


    user_id UUID
        REFERENCES users(id)
        ON DELETE CASCADE,


    login_successful BOOLEAN DEFAULT FALSE,


    ip_address VARCHAR(100),


    failure_reason TEXT,


    created_at TIMESTAMP DEFAULT NOW()

);




CREATE TABLE user_mfa_settings (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),


    user_id UUID UNIQUE
        REFERENCES users(id)
        ON DELETE CASCADE,


    enabled BOOLEAN DEFAULT FALSE,


    secret_key TEXT,


    created_at TIMESTAMP DEFAULT NOW()

);




CREATE TABLE security_events (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),


    user_id UUID
        REFERENCES users(id)
        ON DELETE CASCADE,


    event_type VARCHAR(100),


    description TEXT,


    severity VARCHAR(50)
        DEFAULT 'LOW',


    created_at TIMESTAMP DEFAULT NOW()

);




CREATE INDEX idx_refresh_token
ON refresh_tokens(token);


CREATE INDEX idx_email_token
ON email_verification_tokens(token);


CREATE INDEX idx_password_token
ON password_reset_tokens(token);


CREATE INDEX idx_login_history_user
ON login_history(user_id);