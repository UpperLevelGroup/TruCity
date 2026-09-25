package com.trucity.auth;

import com.trucity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByToken(String token);

    @Modifying
    @Query("""
        DELETE FROM PasswordResetToken t
        WHERE t.user = :user
        AND t.usedAt IS NULL
        """)
    void deleteActiveTokensForUser(@Param("user") User user);
}