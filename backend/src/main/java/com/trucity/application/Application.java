package com.trucity.application;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "applications")
@Getter
@Setter
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "job_id")
    private UUID jobId;

    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "status")
    private String status;

    @Column(name = "applied_at")
    private LocalDateTime appliedAt;
}