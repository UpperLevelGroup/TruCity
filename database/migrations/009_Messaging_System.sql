-- ============================================================
-- TruCity Messaging System
-- ============================================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    participant_one_type VARCHAR(20) NOT NULL,
    participant_one_id UUID,

    participant_two_type VARCHAR(20) NOT NULL,
    participant_two_id UUID,

    created_by_type VARCHAR(20) NOT NULL,
    created_by_id UUID,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT conversations_participant_one_type_check
        CHECK (
            participant_one_type IN (
                'EMPLOYER',
                'CANDIDATE',
                'ADMIN',
                'CHATBOT'
            )
        ),

    CONSTRAINT conversations_participant_two_type_check
        CHECK (
            participant_two_type IN (
                'EMPLOYER',
                'CANDIDATE',
                'ADMIN',
                'CHATBOT'
            )
        ),

    CONSTRAINT conversations_created_by_type_check
        CHECK (
            created_by_type IN (
                'EMPLOYER',
                'CANDIDATE',
                'ADMIN',
                'CHATBOT'
            )
        )
);


CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id UUID NOT NULL,

    sender_type VARCHAR(20) NOT NULL,
    sender_id UUID,

    message TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    read_at TIMESTAMP NULL,

    CONSTRAINT messages_conversation_fk
        FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE,

    CONSTRAINT messages_sender_type_check
        CHECK (
            sender_type IN (
                'EMPLOYER',
                'CANDIDATE',
                'ADMIN',
                'CHATBOT'
            )
        ),

    CONSTRAINT messages_text_not_empty
        CHECK (LENGTH(TRIM(message)) > 0)
);


CREATE INDEX IF NOT EXISTS idx_conversations_participant_one
    ON conversations(participant_one_type, participant_one_id);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_two
    ON conversations(participant_two_type, participant_two_id);

CREATE INDEX IF NOT EXISTS idx_conversations_updated_at
    ON conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON messages(conversation_id, created_at);
