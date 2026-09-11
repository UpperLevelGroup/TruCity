package com.trucity.verification;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "verification_requests")
@Getter
@Setter
public class Verification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "verification_type")
    private String verificationType;

    @Column(name = "status")
    private String status;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
}