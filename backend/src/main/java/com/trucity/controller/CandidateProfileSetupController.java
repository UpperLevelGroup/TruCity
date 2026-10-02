package com.trucity.candidate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Candidate onboarding/profile setup.
 *
 * Ownership is always resolved from the authenticated JWT email.
 * No candidate id is accepted from the browser.
 */
@RestController
@RequestMapping("/api/candidate/profile/setup")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CANDIDATE')")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateProfileSetupController {

    @PersistenceContext
    private EntityManager entityManager;

    private final ObjectMapper objectMapper;

    @GetMapping
    @Transactional
    public ProfileSetupResponse getSetup(
            Authentication authentication
    ) {
        UUID candidateId = findCandidateId(authentication);

        ensureDetailsRow(candidateId);

        Object[] row = (Object[]) entityManager.createNativeQuery("""
                SELECT
                    id_number,
                    industry,
                    experience_range,
                    face_photo,
                    full_body_photo,
                    intro_reel
                FROM candidate_profile_details
                WHERE candidate_id = :candidateId
                LIMIT 1
                """)
                .setParameter("candidateId", candidateId)
                .getSingleResult();

        return new ProfileSetupResponse(
                toStringValue(row[0]),
                toStringValue(row[1]),
                toStringValue(row[2]),
                toStringValue(row[3]),
                toStringValue(row[4]),
                readIntroReel(toStringValue(row[5]))
        );
    }

    @PutMapping
    @Transactional
    @ResponseStatus(HttpStatus.OK)
    public ProfileSetupResponse saveSetup(
            @RequestBody ProfileSetupRequest request,
            Authentication authentication
    ) {
        UUID candidateId = findCandidateId(authentication);

        if (request == null) {
            throw new IllegalArgumentException(
                    "Candidate profile setup data is required."
            );
        }

        ensureDetailsRow(candidateId);

        entityManager.createNativeQuery("""
                UPDATE candidate_profile_details
                SET
                    id_number = :idNumber,
                    industry = :industry,
                    experience_range = :experienceRange,
                    face_photo = :facePhoto,
                    full_body_photo = :fullBodyPhoto,
                    intro_reel = :introReel,
                    updated_at = NOW()
                WHERE candidate_id = :candidateId
                """)
                .setParameter("idNumber", clean(request.idNumber()))
                .setParameter("industry", clean(request.industry()))
                .setParameter("experienceRange", clean(request.experience()))
                .setParameter("facePhoto", request.facePhoto())
                .setParameter("fullBodyPhoto", request.fullBodyPhoto())
                .setParameter(
                        "introReel",
                        request.introReel() == null
                                ? null
                                : writeJson(request.introReel())
                )
                .setParameter("candidateId", candidateId)
                .executeUpdate();

        return getSetup(authentication);
    }

    private UUID findCandidateId(
            Authentication authentication
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()) {
            throw new IllegalStateException(
                    "Authenticated candidate could not be identified."
            );
        }

        List<?> rows = entityManager.createNativeQuery("""
                SELECT cp.id
                FROM candidate_profiles cp
                JOIN users u
                    ON u.id = cp.user_id
                WHERE LOWER(u.email) = LOWER(:email)
                LIMIT 1
                """)
                .setParameter(
                        "email",
                        authentication.getName().trim()
                )
                .getResultList();

        if (rows.isEmpty()) {
            throw new IllegalArgumentException(
                    "Candidate profile was not found."
            );
        }

        return toUuid(rows.get(0));
    }

    private void ensureDetailsRow(UUID candidateId) {
        Number count = (Number) entityManager.createNativeQuery("""
                SELECT COUNT(*)
                FROM candidate_profile_details
                WHERE candidate_id = :candidateId
                """)
                .setParameter("candidateId", candidateId)
                .getSingleResult();

        if (count.longValue() == 0) {
            entityManager.createNativeQuery("""
                    INSERT INTO candidate_profile_details (
                        candidate_id,
                        updated_at
                    )
                    VALUES (
                        :candidateId,
                        NOW()
                    )
                    """)
                    .setParameter("candidateId", candidateId)
                    .executeUpdate();
        }
    }

    private IntroReelMeta readIntroReel(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return objectMapper.readValue(
                    value,
                    IntroReelMeta.class
            );
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(
                    "Stored candidate intro reel data is invalid.",
                    e
            );
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(
                    "Unable to store candidate profile setup data.",
                    e
            );
        }
    }

    private static String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private static String toStringValue(Object value) {
        return value == null ? null : value.toString();
    }

    private static UUID toUuid(Object value) {
        if (value instanceof UUID uuid) {
            return uuid;
        }

        return value == null
                ? null
                : UUID.fromString(value.toString());
    }

    public record ProfileSetupRequest(
            String idNumber,
            String industry,
            String experience,
            String facePhoto,
            String fullBodyPhoto,
            IntroReelMeta introReel
    ) {
    }

    public record ProfileSetupResponse(
            String idNumber,
            String industry,
            String experience,
            String facePhoto,
            String fullBodyPhoto,
            IntroReelMeta introReel
    ) {
    }

    public record IntroReelMeta(
            String fileName,
            String fileSize,
            String uploadedAt,
            String dataUrl
    ) {
    }
}
