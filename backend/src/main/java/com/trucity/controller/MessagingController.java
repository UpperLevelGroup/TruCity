package com.trucity.controller;

import com.trucity.messaging.MessagingDtos;
import com.trucity.messaging.MessagingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class MessagingController {

    private final MessagingService messagingService;


    @GetMapping("/conversations")
    public List<MessagingDtos.ConversationResponse>
    getConversations(
            Authentication authentication
    ) {

        return messagingService.getConversations(
                authentication.getName()
        );
    }


    @PostMapping("/conversations")
    public MessagingDtos.ConversationResponse
    createConversation(
            @RequestBody
            MessagingDtos.CreateConversationRequest request,

            Authentication authentication
    ) {

        return messagingService.createConversation(
                authentication.getName(),
                request.targetType(),
                request.targetId()
        );
    }


    @GetMapping("/conversations/{conversationId}")
    public MessagingDtos.ConversationMessagesResponse
    getMessages(
            @PathVariable UUID conversationId,
            Authentication authentication
    ) {

        return messagingService.getMessages(
                conversationId,
                authentication.getName()
        );
    }


    @PostMapping("/conversations/{conversationId}/messages")
    public MessagingDtos.MessageResponse
    sendMessage(
            @PathVariable UUID conversationId,

            @RequestBody
            MessagingDtos.SendMessageRequest request,

            Authentication authentication
    ) {

        return messagingService.sendMessage(
                conversationId,
                authentication.getName(),
                request.text()
        );
    }
}