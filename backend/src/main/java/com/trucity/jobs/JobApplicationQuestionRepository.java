package com.trucity.jobs;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobApplicationQuestionRepository
        extends JpaRepository<JobApplicationQuestion, UUID> {

    List<JobApplicationQuestion> findAllByJobIdAndActiveTrueOrderByDisplayOrderAsc(
            UUID jobId
    );

    List<JobApplicationQuestion> findAllByJobIdOrderByDisplayOrderAsc(
            UUID jobId
    );

    Optional<JobApplicationQuestion> findByIdAndJobId(
            UUID id,
            UUID jobId
    );

    void deleteAllByJobId(UUID jobId);
}