package com.trucity.application;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApplicationResponseService {

    private final ObjectMapper objectMapper;

    @PersistenceContext
    private EntityManager entityManager;
    

    /**
     * Returns submitted answers only when the application belongs
     * to a job owned by the authenticated employer's company.
     */
    public List<ApplicationAnswerResponse> getResponses(
            UUID applicationId,
            String employerEmail
    ) {
        if (applicationId == null) {
            throw new IllegalArgumentException(
                    "Application ID is required."
            );
        }

        if (employerEmail == null || employerEmail.isBlank()) {
            throw new IllegalArgumentException(
                    "Employer email is required."
            );
        }

        String email = employerEmail.trim();

        Number ownedApplicationCount = (Number) entityManager
                .createNativeQuery("""
                    SELECT COUNT(*)
                    FROM applications a
                    INNER JOIN jobs j ON j.id = a.job_id
                    WHERE a.id = :applicationId
                      AND EXISTS (
                          SELECT 1
                          FROM employer_profiles ep
                          INNER JOIN users employer_user
                              ON employer_user.id = ep.user_id
                          WHERE ep.company_id = j.company_id
                            AND LOWER(employer_user.email) =
                                LOWER(:employerEmail)
                      )
                    """)
                .setParameter("applicationId", applicationId)
                .setParameter("employerEmail", email)
                .getSingleResult();

        if (ownedApplicationCount.longValue() == 0) {
            throw new IllegalArgumentException(
                    "Application not found or does not belong "
                    + "to the logged-in employer."
            );
        }

        List<?> rows = entityManager
                .createNativeQuery("""
                    SELECT
                        aa.id,
                        aa.question_id,
                        aa.question_text_snapshot,
                        aa.question_type_snapshot,
                        aa.answer_text,
                        CAST(aa.answer_json AS text),
                        aa.created_at
                    FROM application_answers aa
                    INNER JOIN applications a
                        ON a.id = aa.application_id
                    INNER JOIN jobs j
                        ON j.id = a.job_id
                    WHERE a.id = :applicationId
                      AND EXISTS (
                          SELECT 1
                          FROM employer_profiles ep
                          INNER JOIN users employer_user
                              ON employer_user.id = ep.user_id
                          WHERE ep.company_id = j.company_id
                            AND LOWER(employer_user.email) =
                                LOWER(:employerEmail)
                      )
                    ORDER BY aa.created_at ASC, aa.id ASC
                    """)
                .setParameter("applicationId", applicationId)
                .setParameter("employerEmail", email)
                .getResultList();

        List<ApplicationAnswerResponse> responses =
                new ArrayList<>();

        for (Object result : rows) {
            Object[] row = (Object[]) result;

            responses.add(new ApplicationAnswerResponse(
                    toUuid(row[0]),
                    toUuid(row[1]),
                    toStringOrNull(row[2]),
                    toStringOrNull(row[3]),
                    toStringOrNull(row[4]),
                    toStringOrNull(row[5]),
                    toLocalDateTime(row[6])
            ));
        }

        return responses;
    }

    /**
 * Returns the CV snapshot submitted with an application.
 * Access is restricted to employers who own the job's company.
 */
public ApplicationResumeResponse getResume(
        UUID applicationId,
        String employerEmail
) {
    if (applicationId == null) {
        throw new IllegalArgumentException(
                "Application ID is required."
        );
    }

    if (employerEmail == null || employerEmail.isBlank()) {
        throw new IllegalArgumentException(
                "Employer email is required."
        );
    }

    List<?> rows = entityManager.createNativeQuery("""
            SELECT
                a.id,
                a.candidate_id,
                a.selected_resume_id,
                COALESCE(
                    a.resume_snapshot,
                    cr.structured_data
                )::text AS resume_json
            FROM public.applications a
            INNER JOIN public.jobs j
                ON j.id = a.job_id
            LEFT JOIN public.candidate_resumes cr
                ON cr.id = a.selected_resume_id
               AND cr.candidate_id = a.candidate_id
            WHERE a.id = :applicationId
              AND EXISTS (
                  SELECT 1
                  FROM public.employer_profiles ep
                  INNER JOIN public.users employer_user
                      ON employer_user.id = ep.user_id
                  WHERE ep.company_id = j.company_id
                    AND LOWER(employer_user.email) =
                        LOWER(:employerEmail)
              )
            """)
            .setParameter("applicationId", applicationId)
            .setParameter("employerEmail", employerEmail.trim())
            .getResultList();

    if (rows.isEmpty()) {
        throw new IllegalArgumentException(
                "Application not found or does not belong "
                + "to the logged-in employer."
        );
    }

    Object[] row = (Object[]) rows.get(0);

    String resumeJson = row[3] == null
            ? null
            : row[3].toString();

    if (resumeJson == null || resumeJson.isBlank()) {
        throw new IllegalStateException(
                "No CV snapshot was found for this application."
        );
    }

    try {
        JsonNode resume = objectMapper.readTree(resumeJson);

        return new ApplicationResumeResponse(
                toUuid(row[0]),
                toUuid(row[1]),
                toUuid(row[2]),
                resume
        );
    } catch (Exception exception) {
        throw new IllegalStateException(
                "The submitted CV could not be read.",
                exception
        );
    }
}

public record ApplicationResumeResponse(
        UUID applicationId,
        UUID candidateId,
        UUID resumeId,
        JsonNode resume
) {}

    private UUID toUuid(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof UUID uuid) {
            return uuid;
        }

        return UUID.fromString(value.toString());
    }

    private String toStringOrNull(Object value) {
        return value == null ? null : value.toString();
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof LocalDateTime dateTime) {
            return dateTime;
        }

        if (value instanceof java.sql.Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }

        return LocalDateTime.parse(value.toString());
    }

    public record ApplicationAnswerResponse(
            UUID id,
            UUID questionId,
            String questionText,
            String questionType,
            String answerText,
            String answerJson,
            LocalDateTime submittedAt
    ) {}
}