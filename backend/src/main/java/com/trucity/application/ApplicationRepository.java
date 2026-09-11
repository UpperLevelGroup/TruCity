package com.trucity.application;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    long countByJobId(UUID jobId);
}