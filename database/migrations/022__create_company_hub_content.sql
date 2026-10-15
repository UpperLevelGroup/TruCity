-- Company Hub only. Apply to local PostgreSQL first and review before live deployment.
CREATE TABLE IF NOT EXISTS company_hub_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(180) NOT NULL,
    summary VARCHAR(500),
    body TEXT,
    content_type VARCHAR(30) NOT NULL DEFAULT 'STORY',
    category VARCHAR(80),
    event_starts_at TIMESTAMP NULL,
    event_ends_at TIMESTAMP NULL,
    event_location VARCHAR(250),
    media_path VARCHAR(500),
    media_content_type VARCHAR(100),
    media_original_name VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_company_hub_content_type CHECK (content_type IN ('STORY','NEWS','SEMINAR','WEBINAR','TRAINING','VIDEO')),
    CONSTRAINT chk_company_hub_content_status CHECK (status IN ('DRAFT','PUBLISHED')),
    CONSTRAINT chk_company_hub_event_range CHECK (event_ends_at IS NULL OR event_starts_at IS NULL OR event_ends_at >= event_starts_at)
);
CREATE INDEX IF NOT EXISTS idx_company_hub_company_updated ON company_hub_content(company_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_hub_published ON company_hub_content(status, published_at DESC);
