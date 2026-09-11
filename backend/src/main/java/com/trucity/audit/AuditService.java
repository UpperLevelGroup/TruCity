package com.trucity.audit;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {

    @PersistenceContext
    private EntityManager entityManager;


    /*
     * =========================================================
     * RECORD AUDIT EVENT
     * =========================================================
     */

    @Transactional
    public void log(
            UUID userId,
            String action,
            String description
    ) {

        entityManager.createNativeQuery("""
                INSERT INTO audit_logs (
                    user_id,
                    action,
                    description,
                    created_at
                )
                VALUES (
                    :userId,
                    :action,
                    :description,
                    NOW()
                )
                """)
                .setParameter("userId", userId)
                .setParameter("action", action)
                .setParameter("description", description)
                .executeUpdate();
    }


    /*
     * =========================================================
     * SYSTEM EVENT
     * =========================================================
     *
     * Used when there is no authenticated user.
     */

    @Transactional
    public void logSystem(
            String action,
            String description
    ) {

        entityManager.createNativeQuery("""
                INSERT INTO audit_logs (
                    user_id,
                    action,
                    description,
                    created_at
                )
                VALUES (
                    NULL,
                    :action,
                    :description,
                    NOW()
                )
                """)
                .setParameter("action", action)
                .setParameter("description", description)
                .executeUpdate();
    }
}