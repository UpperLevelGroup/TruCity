package com.trucity.application;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ApplicationAnswerRepository
        extends JpaRepository<ApplicationAnswer, UUID> {

    List<ApplicationAnswer> findAllByApplicationIdOrderByCreatedAtAsc(
            UUID applicationId
    );

    void deleteAllByApplicationId(UUID applicationId);
}
