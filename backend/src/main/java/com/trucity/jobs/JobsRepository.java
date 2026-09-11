package com.trucity.jobs;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface JobsRepository
        extends JpaRepository<Jobs, UUID> {

    List<Jobs> findAllByOrderByCreatedAtDesc();

    List<Jobs> findAllByStatusNotOrderByCreatedAtDesc(
            String status
    );

    @Query(
            value = """
                    SELECT ep.company_id
                    FROM employer_profiles ep
                    JOIN users u
                        ON u.id = ep.user_id
                    WHERE LOWER(u.email) = LOWER(:email)
                    LIMIT 1
                    """,
            nativeQuery = true
    )
    UUID findCompanyIdByEmployerEmail(
            @Param("email") String email
    );

    @Query(
            value = """
                    SELECT j.*
                    FROM jobs j
                    JOIN employer_profiles ep
                        ON ep.company_id = j.company_id
                    JOIN users u
                        ON u.id = ep.user_id
                    WHERE LOWER(u.email) = LOWER(:email)
                    ORDER BY j.created_at DESC
                    """,
            nativeQuery = true
    )
    List<Jobs> findAllForEmployer(
            @Param("email") String email
    );

    @Query(
            value = """
                    SELECT j.*
                    FROM jobs j
                    JOIN employer_profiles ep
                        ON ep.company_id = j.company_id
                    JOIN users u
                        ON u.id = ep.user_id
                    WHERE j.id = :jobId
                      AND LOWER(u.email) = LOWER(:email)
                    LIMIT 1
                    """,
            nativeQuery = true
    )
    Jobs findEmployerJob(
            @Param("jobId") UUID jobId,
            @Param("email") String email
    );

    @Modifying
    @Query(
            value = """
                    DELETE FROM jobs j
                    WHERE j.id = :jobId
                      AND j.company_id = (
                          SELECT ep.company_id
                          FROM employer_profiles ep
                          JOIN users u
                              ON u.id = ep.user_id
                          WHERE LOWER(u.email) = LOWER(:email)
                          LIMIT 1
                      )
                    """,
            nativeQuery = true
    )
    int deleteEmployerJob(
            @Param("jobId") UUID jobId,
            @Param("email") String email
    );
}