package com.trucity.messaging;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "conversations",
        indexes = {
                @Index(
                        name = "idx_conversations_participant_one",
                        columnList = "participant_one_type, participant_one_id"
                ),
                @Index(
                        name = "idx_conversations_participant_two",
                        columnList = "participant_two_type, participant_two_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "participant_one_type", nullable = false)
    private String participantOneType;

    @Column(name = "participant_one_id")
    private UUID participantOneId;

    @Column(name = "participant_two_type", nullable = false)
    private String participantTwoType;

    @Column(name = "participant_two_id")
    private UUID participantTwoId;

    @Column(name = "created_by_type", nullable = false)
    private String createdByType;

    @Column(name = "created_by_id")
    private UUID createdById;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}