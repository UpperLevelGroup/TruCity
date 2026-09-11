package com.trucity.verification;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "verification_results")
@Getter
@Setter
public class VerificationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "request_id")
    private UUID requestId;

    @Column(name = "verifier_name")
    private String verifierName;

    @Column(name = "result")
    private String result;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
}