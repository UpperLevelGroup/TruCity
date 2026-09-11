package com.trucity.jobs;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Automatically closes expired job posts and rejects every application
 * attached to those expired jobs.
 */
@Service
@RequiredArgsConstructor
public class JobExpiryService {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public int expireJobsAndRejectApplications() {
        // First reject every application belonging to an expired post.
        int rejectedApplications = entityManager.createNativeQuery("""
                UPDATE applications a
                SET status = 'REJECTED'
                FROM jobs j
                WHERE j.id = a.job_id
                  AND j.application_deadline IS NOT NULL
                  AND j.application_deadline < CURRENT_DATE
                  AND UPPER(COALESCE(a.status, '')) <> 'REJECTED'
                """)
                .executeUpdate();

        // Then close the expired posts so they cannot remain active.
        entityManager.createNativeQuery("""
                UPDATE jobs
                SET status = 'CLOSED'
                WHERE application_deadline IS NOT NULL
                  AND application_deadline < CURRENT_DATE
                  AND UPPER(COALESCE(status, '')) <> 'CLOSED'
                """)
                .executeUpdate();

        return rejectedApplications;
    }
}
