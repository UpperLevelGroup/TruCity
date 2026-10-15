package com.trucity.controller;

import com.trucity.messaging.MessagingDtos.ConversationMessagesResponse;
import com.trucity.messaging.MessagingDtos.ConversationResponse;
import com.trucity.messaging.MessagingDtos.CreateConversationRequest;
import com.trucity.messaging.MessagingDtos.MessageResponse;
import com.trucity.messaging.MessagingDtos.SendMessageRequest;
import com.trucity.messaging.MessagingService;
import org.springframework.http.ResponseEntity;


import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessagingController {

    private final MessagingService messagingService;

    @GetMapping("/conversations")
    public List<ConversationResponse> getConversations(
            Authentication authentication
    ) {
        return messagingService.getConversations(
                requireEmail(authentication)
        );
    }

    @PostMapping("/conversations")
    @ResponseStatus(HttpStatus.CREATED)
    public ConversationResponse createConversation(
            @RequestBody CreateConversationRequest request,
            Authentication authentication
    ) {
        if (request == null || request.targetType() == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Target type is required."
            );
        }

        return messagingService.createConversation(
                requireEmail(authentication),
                request.targetType(),
                request.targetId()
        );
    }

    @GetMapping("/conversations/{conversationId}")
    public ConversationMessagesResponse getMessages(
            @PathVariable UUID conversationId,
            Authentication authentication
    ) {
        return messagingService.getMessages(
                conversationId,
                requireEmail(authentication)
        );
    }

    @PatchMapping("/conversations/{conversationId}/read")
public ResponseEntity<Void> markConversationRead(
        @PathVariable UUID conversationId,
        Authentication authentication
) {
    messagingService.markConversationRead(
            conversationId,
            requireEmail(authentication)
    );

    return ResponseEntity.noContent().build();
}

    @PostMapping("/conversations/{conversationId}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse sendMessage(
            @PathVariable UUID conversationId,
            @RequestBody SendMessageRequest request,
            Authentication authentication
    ) {
        if (request == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Message body is required."
            );
        }

        return messagingService.sendMessage(
                conversationId,
                requireEmail(authentication),
                request.text()
        );
    }

    private String requireEmail(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication is required."
            );
        }

        return authentication.getName();
    }
}