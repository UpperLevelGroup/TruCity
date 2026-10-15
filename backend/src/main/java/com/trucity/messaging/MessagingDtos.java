package com.trucity.messaging;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class MessagingDtos {

    private MessagingDtos() {
        // Utility class; DTOs are defined as nested records.
    }

    public record ConversationResponse(
            UUID id,
            String participantType,
            UUID participantId,
            String participantName,
            String participantRole,
            String lastMessage,
            LocalDateTime lastMessageAt,
            long unreadCount
    ) {
    }

    public record MessageResponse(
            UUID id,
            UUID conversationId,
            String senderType,
            UUID senderId,
            String senderName,
            String text,
            LocalDateTime createdAt,
            LocalDateTime readAt
    ) {
    }

    public record ConversationMessagesResponse(
            ConversationResponse conversation,
            List<MessageResponse> messages
    ) {
    }

    public record CreateConversationRequest(
            String targetType,
            UUID targetId
    ) {
    }

    public record SendMessageRequest(
            String text
    ) {
    }
}
