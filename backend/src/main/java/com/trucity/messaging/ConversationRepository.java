package com.trucity.messaging;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository
        extends JpaRepository<Conversation, UUID> {

    @Query("""
        SELECT c
        FROM Conversation c
        WHERE
            (
                c.participantOneType = :type
                AND (
                    (:id IS NULL AND c.participantOneId IS NULL)
                    OR
                    (:id IS NOT NULL AND c.participantOneId = :id)
                )
            )
            OR
            (
                c.participantTwoType = :type
                AND (
                    (:id IS NULL AND c.participantTwoId IS NULL)
                    OR
                    (:id IS NOT NULL AND c.participantTwoId = :id)
                )
            )
        ORDER BY c.updatedAt DESC
        """)
    List<Conversation> findForParticipant(
            @Param("type") String type,
            @Param("id") UUID id
    );

    @Query("""
        SELECT c
        FROM Conversation c
        WHERE
            (
                c.participantOneType = :typeOne
                AND (
                    (:idOne IS NULL AND c.participantOneId IS NULL)
                    OR
                    (:idOne IS NOT NULL AND c.participantOneId = :idOne)
                )
                AND
                c.participantTwoType = :typeTwo
                AND (
                    (:idTwo IS NULL AND c.participantTwoId IS NULL)
                    OR
                    (:idTwo IS NOT NULL AND c.participantTwoId = :idTwo)
                )
            )
            OR
            (
                c.participantOneType = :typeTwo
                AND (
                    (:idTwo IS NULL AND c.participantOneId IS NULL)
                    OR
                    (:idTwo IS NOT NULL AND c.participantOneId = :idTwo)
                )
                AND
                c.participantTwoType = :typeOne
                AND (
                    (:idOne IS NULL AND c.participantTwoId IS NULL)
                    OR
                    (:idOne IS NOT NULL AND c.participantTwoId = :idOne)
                )
            )
        """)
    Optional<Conversation> findBetweenParticipants(
            @Param("typeOne") String typeOne,
            @Param("idOne") UUID idOne,
            @Param("typeTwo") String typeTwo,
            @Param("idTwo") UUID idTwo
    );
}