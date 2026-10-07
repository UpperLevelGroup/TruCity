package com.trucity.company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface EmployerProfileRepository
        extends JpaRepository<EmployerProfile, UUID> {

    Optional<EmployerProfile> findByUserId(UUID userId);

    Optional<EmployerProfile> findByCompanyId(UUID companyId);

    boolean existsByUserId(UUID userId);

    /*
     * Finds the employer profile belonging to the currently
     * authenticated user using the user's email.
     *
     * This avoids requiring the Company module to depend directly
     * on the authentication User entity.
     */
    @Query(
            value = """
                    SELECT ep.*
                    FROM employer_profiles ep
                    JOIN users u
                        ON u.id = ep.user_id
                    WHERE LOWER(u.email) = LOWER(:email)
                    LIMIT 1
                    """,
            nativeQuery = true
    )
    Optional<EmployerProfile> findByEmployerEmail(
            @Param("email") String email
    );

    /*
     * Finds the user's UUID from the authenticated email.
     */
    @Query(
            value = """
                    SELECT u.id
                    FROM users u
                    WHERE LOWER(u.email) = LOWER(:email)
                    LIMIT 1
                    """,
            nativeQuery = true
    )
    Optional<UUID> findUserIdByEmail(
            @Param("email") String email
    );
}