package com.trucity.verification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VerificationResultRepository
        extends JpaRepository<VerificationResult, UUID> {

    Optional<VerificationResult> findByRequestId(UUID requestId);
}