package com.trucity.verification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VerificationRepository
        extends JpaRepository<Verification, UUID> {

    List<Verification> findAllByOrderBySubmittedAtDesc();
}