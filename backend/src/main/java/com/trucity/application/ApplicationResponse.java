package com.trucity.application;

import java.time.LocalDateTime;
import java.util.UUID;

public record ApplicationResponse(

        UUID id,

        UUID candidateId,

        String candidateName,

        String email,

        UUID jobId,

        String jobTitle,

        UUID companyId,

        String companyName,

        String status,

        LocalDateTime appliedAt

) {
}