package com.trucity.messaging;

import com.trucity.messaging.MessagingDtos.ConversationMessagesResponse;
import com.trucity.messaging.MessagingDtos.ConversationResponse;
import com.trucity.messaging.MessagingDtos.MessageResponse;
import com.trucity.user.User;
import com.trucity.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;

    /*
     * ============================================================
     * CONVERSATIONS
     * ============================================================
     */

    public List<ConversationResponse> getConversations(
            String email
    ) {
        User user = getUser(email);

        String currentType = getUserType(user);
        UUID currentId = getParticipantId(user, currentType);

        List<Conversation> conversations =
                conversationRepository.findForParticipant(
                        currentType,
                        currentId
                );

        return conversations.stream()
                .map(conversation ->
                        toConversationResponse(
                                conversation,
                                currentType,
                                currentId
                        )
                )
                .collect(Collectors.toList());
    }

    /*
     * ============================================================
     * CREATE / GET CONVERSATION
     * ============================================================
     */

    @Transactional
    public ConversationResponse createConversation(
            String email,
            String targetType,
            UUID targetId
    ) {
        User user = getUser(email);

        String currentType = getUserType(user);
        UUID currentId = getParticipantId(user, currentType);

        MessageType target;

        try {
            target = MessageType.valueOf(
                    targetType.toUpperCase(Locale.ROOT)
            );
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid target type."
            );
        }

        validateInitiationPermission(
                currentType,
                target
        );

        validateTarget(
                target,
                targetId
        );

        Optional<Conversation> existing =
                conversationRepository.findBetweenParticipants(
                        currentType,
                        currentId,
                        target.name(),
                        targetId
                );

        if (existing.isPresent()) {
            return toConversationResponse(
                    existing.get(),
                    currentType,
                    currentId
            );
        }

        Conversation conversation =
                Conversation.builder()
                        .participantOneType(currentType)
                        .participantOneId(currentId)
                        .participantTwoType(target.name())
                        .participantTwoId(targetId)
                        .createdByType(currentType)
                        .createdById(currentId)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

        conversation =
                conversationRepository.save(
                        conversation
                );

        return toConversationResponse(
                conversation,
                currentType,
                currentId
        );
    }

    /*
     * ============================================================
     * GET MESSAGES
     * ============================================================
     */

    public ConversationMessagesResponse getMessages(
            UUID conversationId,
            String email
    ) {
        User user = getUser(email);

        String currentType = getUserType(user);
        UUID currentId = getParticipantId(user, currentType);

        Conversation conversation =
                getConversation(conversationId);

        ensureParticipant(
                conversation,
                currentType,
                currentId
        );

        List<Message> messages =
                messageRepository
                        .findByConversationIdOrderByCreatedAtAsc(
                                conversationId
                        );

        ConversationResponse conversationResponse =
                toConversationResponse(
                        conversation,
                        currentType,
                        currentId
                );

        List<MessageResponse> messageResponses =
                messages.stream()
                        .map(this::toMessageResponse)
                        .collect(Collectors.toList());

        markMessagesRead(
                conversation,
                currentType
        );

        return new ConversationMessagesResponse(
                conversationResponse,
                messageResponses
        );
    }

    /*
     * ============================================================
     * SEND MESSAGE
     * ============================================================
     */

    @Transactional
    public MessageResponse sendMessage(
            UUID conversationId,
            String email,
            String text
    ) {
        if (text == null || text.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Message cannot be empty."
            );
        }

        String cleanedText = text.trim();

        if (cleanedText.length() > 5000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Message cannot exceed 5000 characters."
            );
        }

        User user = getUser(email);

        String senderType = getUserType(user);

        UUID senderId =
                getParticipantId(
                        user,
                        senderType
                );

        Conversation conversation =
                getConversation(conversationId);

        ensureParticipant(
                conversation,
                senderType,
                senderId
        );

        Message message =
                Message.builder()
                        .conversationId(conversationId)
                        .senderType(senderType)
                        .senderId(senderId)
                        .message(cleanedText)
                        .createdAt(LocalDateTime.now())
                        .build();

        message =
                messageRepository.save(message);

        conversation.setUpdatedAt(
                LocalDateTime.now()
        );

        conversationRepository.save(
                conversation
        );

        /*
         * Chatbot responses are intentionally not automatically
         * generated yet.
         */

        return toMessageResponse(message);
    }

    /*
     * ============================================================
     * PERMISSIONS
     * ============================================================
     */

    private void validateInitiationPermission(
            String sender,
            MessageType target
    ) {
        boolean allowed = switch (sender) {

            /*
             * Company employees can initiate with:
             * - Candidate
             * - Admin
             * - Chatbot
             */
            case "EMPLOYER" ->
                    target == MessageType.CANDIDATE
                            || target == MessageType.ADMIN
                            || target == MessageType.CHATBOT;

            /*
             * Candidates can initiate with:
             * - Admin
             * - Chatbot
             */
            case "CANDIDATE" ->
                    target == MessageType.ADMIN
                            || target == MessageType.CHATBOT;

            /*
             * Admins can initiate with:
             * - Company
             * - Candidate
             */
            case "ADMIN" ->
                    target == MessageType.EMPLOYER
                            || target == MessageType.CANDIDATE;

            default ->
                    false;
        };

        if (!allowed) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to initiate a conversation with this participant."
            );
        }
    }

    /*
     * ============================================================
     * TARGET VALIDATION
     * ============================================================
     */

    private void validateTarget(
            MessageType target,
            UUID targetId
    ) {
        if (target == MessageType.CHATBOT) {

            if (targetId != null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Chatbot conversations do not require a target ID."
                );
            }

            return;
        }

        if (targetId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A target ID is required."
            );
        }

        boolean exists;

        switch (target) {

            case CANDIDATE -> {
                exists =
                        userRepository.existsById(targetId)
                                &&
                        existsWithRole(
                                targetId,
                                "CANDIDATE"
                        );
            }

            case ADMIN -> {
                exists =
                        userRepository.existsById(targetId)
                                &&
                        existsWithRole(
                                targetId,
                                "ADMIN"
                        );
            }

            case EMPLOYER -> {
                exists =
                        Boolean.TRUE.equals(
                                jdbcTemplate.queryForObject(
                                        """
                                        SELECT EXISTS (
                                            SELECT 1
                                            FROM companies
                                            WHERE id = ?
                                        )
                                        """,
                                        Boolean.class,
                                        targetId
                                )
                        );
            }

            default -> exists = false;
        }

        if (!exists) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "The requested messaging participant does not exist."
            );
        }
    }

    private boolean existsWithRole(
            UUID userId,
            String roleName
    ) {
        Boolean result =
                jdbcTemplate.queryForObject(
                        """
                        SELECT EXISTS (
                            SELECT 1
                            FROM user_roles ur
                            JOIN roles r
                              ON r.id = ur.role_id
                            WHERE ur.user_id = ?
                              AND UPPER(r.name) = UPPER(?)
                        )
                        """,
                        Boolean.class,
                        userId,
                        roleName
                );

        return Boolean.TRUE.equals(result);
    }

    /*
     * ============================================================
     * AUTHENTICATED USER
     * ============================================================
     */

    private User getUser(String email) {
        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Authenticated user not found."
                        )
                );
    }

    private String getUserType(User user) {

        return user.getRoles()
                .stream()
                .map(userRole ->
                        userRole.getName()
                                .toUpperCase(Locale.ROOT)
                )
                .filter(userRole ->
                        userRole.equals("ADMIN")
                                || userRole.equals("CANDIDATE")
                                || userRole.equals("EMPLOYER")
                                || userRole.equals("VERIFIER")
                )
                .findFirst()
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.FORBIDDEN,
                                "User does not have a messaging role."
                        )
                );
    }

    /*
     * ============================================================
     * PARTICIPANT ID
     * ============================================================
     *
     * EMPLOYER:
     *     participant ID = company ID
     *
     * CANDIDATE:
     *     participant ID = user ID
     *
     * ADMIN:
     *     participant ID = user ID
     *
     * CHATBOT:
     *     participant ID = null
     * ============================================================
     */

    private UUID getParticipantId(
            User user,
            String type
    ) {
        if ("CHATBOT".equals(type)) {
            return null;
        }

        if ("EMPLOYER".equals(type)) {

            UUID companyId =
                    jdbcTemplate.queryForObject(
                            """
                            SELECT company_id
                            FROM employer_profiles
                            WHERE user_id = ?
                            LIMIT 1
                            """,
                            UUID.class,
                            user.getId()
                    );

            if (companyId == null) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Employer is not linked to a company."
                );
            }

            return companyId;
        }

        return user.getId();
    }

    /*
     * ============================================================
     * CONVERSATION SECURITY
     * ============================================================
     */

    private Conversation getConversation(
            UUID conversationId
    ) {
        return conversationRepository
                .findById(conversationId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Conversation not found."
                        )
                );
    }

    private void ensureParticipant(
            Conversation conversation,
            String type,
            UUID id
    ) {
        boolean first =
                conversation.getParticipantOneType()
                        .equals(type)
                        &&
                        idsMatch(
                                conversation.getParticipantOneId(),
                                id
                        );

        boolean second =
                conversation.getParticipantTwoType()
                        .equals(type)
                        &&
                        idsMatch(
                                conversation.getParticipantTwoId(),
                                id
                        );

        if (!first && !second) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not a participant in this conversation."
            );
        }
    }

    private boolean idsMatch(
            UUID stored,
            UUID current
    ) {
        if (stored == null && current == null) {
            return true;
        }

        return stored != null
                && stored.equals(current);
    }

    /*
     * ============================================================
     * RESPONSE MAPPING
     * ============================================================
     */

    private ConversationResponse toConversationResponse(
            Conversation conversation,
            String currentType,
            UUID currentId
    ) {
        boolean currentIsFirst =
                conversation.getParticipantOneType()
                        .equals(currentType)
                        &&
                        idsMatch(
                                conversation.getParticipantOneId(),
                                currentId
                        );

        String targetType =
                currentIsFirst
                        ? conversation.getParticipantTwoType()
                        : conversation.getParticipantOneType();

        UUID targetId =
                currentIsFirst
                        ? conversation.getParticipantTwoId()
                        : conversation.getParticipantOneId();

        ParticipantDetails details =
                resolveParticipant(
                        targetType,
                        targetId
                );

        List<Message> messages =
                messageRepository
                        .findByConversationIdOrderByCreatedAtAsc(
                                conversation.getId()
                        );

        Message lastMessage =
                messages.isEmpty()
                        ? null
                        : messages.get(
                                messages.size() - 1
                        );

        long unread =
                messages.stream()
                        .filter(message ->
                                !message.getSenderType()
                                        .equals(currentType)
                        )
                        .filter(message ->
                                message.getReadAt() == null
                        )
                        .count();

        return new ConversationResponse(
                conversation.getId(),
                targetType,
                targetId,
                details.name(),
                details.role(),
                lastMessage == null
                        ? null
                        : lastMessage.getMessage(),
                lastMessage == null
                        ? null
                        : lastMessage.getCreatedAt(),
                unread
        );
    }

    private MessageResponse toMessageResponse(
            Message message
    ) {
        ParticipantDetails sender =
                resolveParticipant(
                        message.getSenderType(),
                        message.getSenderId()
                );

        return new MessageResponse(
                message.getId(),
                message.getConversationId(),
                message.getSenderType(),
                message.getSenderId(),
                sender.name(),
                message.getMessage(),
                message.getCreatedAt(),
                message.getReadAt()
        );
    }

    /*
     * ============================================================
     * PARTICIPANT DETAILS
     * ============================================================
     */

    private ParticipantDetails resolveParticipant(
            String type,
            UUID id
    ) {
        if ("CHATBOT".equals(type)) {

            return new ParticipantDetails(
                    "TruCity Assistant",
                    "System"
            );
        }

        if ("EMPLOYER".equals(type)) {

            List<ParticipantDetails> results =
                    jdbcTemplate.query(
                            """
                            SELECT name
                            FROM companies
                            WHERE id = ?
                            """,
                            (rs, rowNum) ->
                                    new ParticipantDetails(
                                            rs.getString("name"),
                                            "Company"
                                    ),
                            id
                    );

            if (!results.isEmpty()) {
                return results.get(0);
            }
        }

        if (id != null) {

            Optional<User> user =
                    userRepository.findById(id);

            if (user.isPresent()) {

                User found = user.get();

                String name =
                        (
                                Optional.ofNullable(
                                        found.getFirstName()
                                ).orElse("")
                                        + " "
                                        + Optional.ofNullable(
                                        found.getLastName()
                                ).orElse("")
                        ).trim();

                if (name.isBlank()) {
                    name = found.getEmail();
                }

                String participantRole =
                        found.getRoles()
                                .stream()
                                .map(userRole ->
                                        userRole.getName()
                                                .toUpperCase(Locale.ROOT)
                                )
                                .findFirst()
                                .orElse("User");

                return new ParticipantDetails(
                        name,
                        participantRole
                );
            }
        }

        return new ParticipantDetails(
                "Unknown participant",
                type
        );
    }

    private record ParticipantDetails(
            String name,
            String role
    ) {
    }

    /*
     * ============================================================
     * READ STATUS
     * ============================================================
     */

    @Transactional
    protected void markMessagesRead(
            Conversation conversation,
            String currentType
    ) {
        List<Message> messages =
                messageRepository
                        .findByConversationIdOrderByCreatedAtAsc(
                                conversation.getId()
                        );

        LocalDateTime now =
                LocalDateTime.now();

        boolean changed = false;

        for (Message message : messages) {

            if (!message.getSenderType()
                    .equals(currentType)
                    &&
                    message.getReadAt() == null) {

                message.setReadAt(now);
                changed = true;
            }
        }

        if (changed) {
            messageRepository.saveAll(messages);
        }
    }
}