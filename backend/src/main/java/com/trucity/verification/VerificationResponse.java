
package com.trucity.verification;

import java.time.LocalDateTime;
import java.util.UUID;

public record VerificationResponse(
        UUID id,
        UUID candidateId,
        String candidateName,
        String email,
        String verificationType,
        String status,
        LocalDateTime submittedAt,
        String verifierName,
        String result,
        String notes,
        LocalDateTime verifiedAt

) {
}