CREATE TABLE guidance_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(255) NOT NULL,

    content_type VARCHAR(30) NOT NULL
        CHECK (content_type IN ('GUIDE', 'VIDEO', 'AUDIO')),

    audience VARCHAR(30) NOT NULL DEFAULT 'ALL'
        CHECK (audience IN ('ALL', 'CANDIDATE', 'COMPANY')),

    category VARCHAR(100) NOT NULL,

    description TEXT NOT NULL,

    content TEXT,

    media_url TEXT,

    duration VARCHAR(50),

    reading_time VARCHAR(50),

    icon VARCHAR(50),

    published BOOLEAN NOT NULL DEFAULT FALSE,

    featured BOOLEAN NOT NULL DEFAULT FALSE,

    display_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guidance_content_type
    ON guidance_content(content_type);

CREATE INDEX idx_guidance_content_audience
    ON guidance_content(audience);

CREATE INDEX idx_guidance_content_published
    ON guidance_content(published);

CREATE INDEX idx_guidance_content_order
    ON guidance_content(display_order);