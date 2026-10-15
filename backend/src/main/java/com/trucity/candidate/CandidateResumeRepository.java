package com.trucity.candidate;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CandidateResumeRepository
        extends JpaRepository<CandidateResume, UUID> {

    List<CandidateResume> findAllByCandidateIdOrderByUpdatedAtDesc(
            UUID candidateId
    );

    Optional<CandidateResume> findByIdAndCandidateId(
            UUID id,
            UUID candidateId
    );

    Optional<CandidateResume> findByCandidateIdAndIsDefaultTrue(
            UUID candidateId
    );

    boolean existsByIdAndCandidateId(
            UUID id,
            UUID candidateId
    );

    long countByCandidateId(UUID candidateId);
}
