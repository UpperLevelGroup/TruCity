package com.trucity.candidate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CandidateResumeService {

    private final CandidateResumeRepository resumeRepository;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Resolve the candidate profile from the authenticated user's email.
     * Never accept candidateId from the request body.
     */
    @Transactional(readOnly = true)
    public UUID resolveCandidateId(String authenticatedEmail) {
        List<UUID> results = jdbcTemplate.query(
            """
            SELECT cp.id
            FROM candidate_profiles cp
            JOIN users u ON u.id = cp.user_id
            WHERE LOWER(u.email) = LOWER(?)
            LIMIT 1
            """,
            (rs, rowNum) -> rs.getObject("id", UUID.class),
            authenticatedEmail
        );

        if (results.isEmpty()) {
            throw new IllegalStateException(
                "No candidate profile is linked to the authenticated user."
            );
        }

        return results.get(0);
    }

    @Transactional(readOnly = true)
    public List<ResumeResponse> listResumes(String authenticatedEmail) {
        UUID candidateId = resolveCandidateId(authenticatedEmail);

        return resumeRepository
            .findAllByCandidateIdOrderByUpdatedAtDesc(candidateId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ResumeResponse getResume(
        String authenticatedEmail,
        UUID resumeId
    ) {
        UUID candidateId = resolveCandidateId(authenticatedEmail);

        return toResponse(findOwnedResume(resumeId, candidateId));
    }

    @Transactional
    public ResumeResponse createResume(
        String authenticatedEmail,
        SaveResumeRequest request
    ) {
        UUID candidateId = resolveCandidateId(authenticatedEmail);

        validateRequest(request);

        CandidateResume resume = new CandidateResume();
        resume.setCandidateId(candidateId);
        resume.setTitle(request.title().trim());
        resume.setProfessionalTitle(trimToNull(request.professionalTitle()));
        resume.setStructuredData(normalizeStructuredData(request.structuredData()));

        boolean shouldBeDefault = request.isDefault()
            || resumeRepository.findByCandidateIdAndIsDefaultTrue(candidateId)
                .isEmpty();

        if (shouldBeDefault) {
            clearDefaultResume(candidateId);
        }

        resume.setDefault(shouldBeDefault);

        return toResponse(resumeRepository.save(resume));
    }

    @Transactional
    public ResumeResponse updateResume(
        String authenticatedEmail,
        UUID resumeId,
        SaveResumeRequest request
    ) {
        UUID candidateId = resolveCandidateId(authenticatedEmail);

        validateRequest(request);

        CandidateResume resume = findOwnedResume(resumeId, candidateId);

        resume.setTitle(request.title().trim());
        resume.setProfessionalTitle(trimToNull(request.professionalTitle()));
        resume.setStructuredData(normalizeStructuredData(request.structuredData()));

        if (request.isDefault()) {
            clearDefaultResume(candidateId);
            resume.setDefault(true);
        }

        return toResponse(resumeRepository.save(resume));
    }

    @Transactional
    public ResumeResponse setDefaultResume(
        String authenticatedEmail,
        UUID resumeId
    ) {
        UUID candidateId = resolveCandidateId(authenticatedEmail);

        CandidateResume resume = findOwnedResume(resumeId, candidateId);

        clearDefaultResume(candidateId);
        resume.setDefault(true);

        return toResponse(resumeRepository.save(resume));
    }

    @Transactional
    public void deleteResume(
        String authenticatedEmail,
        UUID resumeId
    ) {
        UUID candidateId = resolveCandidateId(authenticatedEmail);

        CandidateResume resume = findOwnedResume(resumeId, candidateId);

        resumeRepository.delete(resume);
    }

    private CandidateResume findOwnedResume(
        UUID resumeId,
        UUID candidateId
    ) {
        return resumeRepository.findByIdAndCandidateId(resumeId, candidateId)
            .orElseThrow(() -> new ResumeNotFoundException(
                "The requested CV was not found for this account."
            ));
    }

    /**
     * Clear the current default before setting another one. This respects
     * the database's partial unique index for one default CV per candidate.
     */
    private void clearDefaultResume(UUID candidateId) {
        resumeRepository.findByCandidateIdAndIsDefaultTrue(candidateId)
            .ifPresent(current -> {
                current.setDefault(false);
                resumeRepository.saveAndFlush(current);
            });
    }

    private void validateRequest(SaveResumeRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("CV details are required.");
        }

        if (request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("A CV title is required.");
        }

        if (request.title().trim().length() > 160) {
            throw new IllegalArgumentException(
                "The CV title must not exceed 160 characters."
            );
        }

        if (request.professionalTitle() != null
            && request.professionalTitle().length() > 180) {
            throw new IllegalArgumentException(
                "The professional title must not exceed 180 characters."
            );
        }

        if (request.structuredData() != null
            && !request.structuredData().isObject()) {
            throw new IllegalArgumentException(
                "CV structuredData must be a JSON object."
            );
        }
    }

    private JsonNode normalizeStructuredData(JsonNode data) {
        if (data == null || data.isNull()) {
            return objectMapper.createObjectNode();
        }

        return data.deepCopy();
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private ResumeResponse toResponse(CandidateResume resume) {
        return new ResumeResponse(
            resume.getId(),
            resume.getTitle(),
            resume.getProfessionalTitle(),
            resume.getStructuredData(),
            resume.isDefault(),
            resume.getCreatedAt(),
            resume.getUpdatedAt()
        );
    }

    public record SaveResumeRequest(
        String title,
        String professionalTitle,
        JsonNode structuredData,
        boolean isDefault
    ) {}

    public record ResumeResponse(
        UUID id,
        String title,
        String professionalTitle,
        JsonNode structuredData,
        boolean isDefault,
        java.time.LocalDateTime createdAt,
        java.time.LocalDateTime updatedAt
    ) {}

    public static class ResumeNotFoundException
            extends RuntimeException {
        public ResumeNotFoundException(String message) {
            super(message);
        }
    }
}