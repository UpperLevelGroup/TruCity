package com.trucity.candidate;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/candidate")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateOpportunityController {

    @PersistenceContext
    private EntityManager entityManager;

    /*
     * =========================================================
     * LIVE OPEN JOBS
     * =========================================================
     *
     * This endpoint is candidate-facing.
     *
     * It deliberately does NOT reuse GET /api/jobs because
     * that route is reserved for administration in TruCity.
     */
    @GetMapping("/jobs/open")
    @PreAuthorize("hasRole('CANDIDATE')")
    public List<CandidateJobResponse> getOpenJobs() {

        @SuppressWarnings("unchecked")
        List<Object[]> rows =
                entityManager.createNativeQuery("""
                        SELECT
                            j.id,
                            j.company_id,
                            c.name,
                            j.title,
                            j.department,
                            j.description,
                            j.location,
                            j.workplace_type,
                            j.employment_type,
                            j.salary_min,
                            j.salary_max,
                            j.salary_currency,
                            j.salary_negotiable,
                            j.qualifications,
                            j.experience_required,
                            j.responsibilities,
                            j.benefits,
                            j.openings,
                            j.application_deadline,
                            j.status,
                            j.created_at
                        FROM jobs j
                        LEFT JOIN companies c
                            ON c.id = j.company_id
                        WHERE UPPER(COALESCE(j.status, '')) IN ('OPEN', 'ACTIVE')
                        ORDER BY j.created_at DESC
                        """)
                .getResultList();

        List<CandidateJobResponse> jobs =
                new ArrayList<>();

        for (Object[] row : rows) {

            UUID jobId =
                    toUuid(row[0]);

            jobs.add(
                    new CandidateJobResponse(
                            jobId,
                            toUuid(row[1]),
                            toString(row[2]),
                            toString(row[3]),
                            toString(row[4]),
                            toString(row[5]),
                            toString(row[6]),
                            toString(row[7]),
                            toString(row[8]),
                            toBigDecimal(row[9]),
                            toBigDecimal(row[10]),
                            toString(row[11]),
                            toBoolean(row[12]),
                            toString(row[13]),
                            toString(row[14]),
                            getJobSkills(jobId),
                            toString(row[15]),
                            toString(row[16]),
                            toInteger(row[17]),
                            toLocalDate(row[18]),
                            toString(row[19]),
                            toLocalDateTime(row[20])
                    )
            );
        }

        return jobs;
    }

    /*
     * =========================================================
     * APPLY TO JOB
     * =========================================================
     *
     * The candidate is identified from the authenticated JWT
     * email. The browser only supplies the job id.
     */
    @PostMapping("/applications")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Transactional
    @ResponseStatus(HttpStatus.CREATED)
    public ApplyResponse apply(
            @RequestBody ApplyRequest request,
            org.springframework.security.core.Authentication authentication
    ) {

        if (request == null || request.jobId() == null) {
            throw new IllegalArgumentException(
                    "Job id is required."
            );
        }

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            throw new IllegalStateException(
                    "Authenticated candidate could not be identified."
            );
        }

        String email =
                authentication.getName().trim();

        UUID candidateId =
                findCandidateId(email);

        if (candidateId == null) {
            throw new IllegalArgumentException(
                    "Candidate profile was not found."
            );
        }

        Number jobExists =
                (Number) entityManager.createNativeQuery("""
                        SELECT COUNT(*)
                        FROM jobs
                        WHERE id = :jobId
                          AND UPPER(COALESCE(status, '')) IN ('OPEN', 'ACTIVE')
                        """)
                        .setParameter(
                                "jobId",
                                request.jobId()
                        )
                        .getSingleResult();

        if (jobExists == null
                || jobExists.longValue() == 0) {

            throw new IllegalArgumentException(
                    "This job is no longer available."
            );
        }

        Number duplicate =
                (Number) entityManager.createNativeQuery("""
                        SELECT COUNT(*)
                        FROM applications
                        WHERE candidate_id = :candidateId
                          AND job_id = :jobId
                        """)
                        .setParameter(
                                "candidateId",
                                candidateId
                        )
                        .setParameter(
                                "jobId",
                                request.jobId()
                        )
                        .getSingleResult();

        if (duplicate != null
                && duplicate.longValue() > 0) {

            throw new IllegalStateException(
                    "You have already applied for this job."
            );
        }

        UUID applicationId =
                UUID.fromString(
                        entityManager.createNativeQuery("""
                                INSERT INTO applications (
                                    job_id,
                                    candidate_id,
                                    status,
                                    applied_at
                                )
                                VALUES (
                                    :jobId,
                                    :candidateId,
                                    'SUBMITTED',
                                    NOW()
                                )
                                RETURNING id
                                """)
                                .setParameter(
                                        "jobId",
                                        request.jobId()
                                )
                                .setParameter(
                                        "candidateId",
                                        candidateId
                                )
                                .getSingleResult()
                                .toString()
                );

        return new ApplyResponse(
                applicationId,
                request.jobId(),
                candidateId,
                "SUBMITTED"
        );
    }

    private UUID findCandidateId(
            String email
    ) {
        List<?> rows =
                entityManager.createNativeQuery("""
                        SELECT cp.id
                        FROM candidate_profiles cp
                        JOIN users u
                            ON u.id = cp.user_id
                        WHERE LOWER(u.email) = LOWER(:email)
                        LIMIT 1
                        """)
                        .setParameter(
                                "email",
                                email
                        )
                        .getResultList();

        if (rows.isEmpty()) {
            return null;
        }

        return toUuid(
                rows.get(0)
        );
    }

    private List<String> getJobSkills(
            UUID jobId
    ) {
        if (jobId == null) {
            return List.of();
        }

        @SuppressWarnings("unchecked")
        List<Object> rows =
                entityManager.createNativeQuery("""
                        SELECT s.name
                        FROM job_skills js
                        JOIN skills s
                            ON s.id = js.skill_id
                        WHERE js.job_id = :jobId
                        ORDER BY s.name
                        """)
                        .setParameter(
                                "jobId",
                                jobId
                        )
                        .getResultList();

        return rows.stream()
                .filter(Objects::nonNull)
                .map(Object::toString)
                .toList();
    }

    private static UUID toUuid(
            Object value
    ) {
        if (value == null) {
            return null;
        }

        return value instanceof UUID uuid
                ? uuid
                : UUID.fromString(
                        value.toString()
                );
    }

    private static String toString(
            Object value
    ) {
        return value == null
                ? null
                : value.toString();
    }

    private static BigDecimal toBigDecimal(
            Object value
    ) {
        if (value == null) {
            return null;
        }

        if (value instanceof BigDecimal decimal) {
            return decimal;
        }

        return new BigDecimal(
                value.toString()
        );
    }

    private static boolean toBoolean(
            Object value
    ) {
        if (value == null) {
            return false;
        }

        if (value instanceof Boolean bool) {
            return bool;
        }

        return Boolean.parseBoolean(
                value.toString()
        );
    }

    private static Integer toInteger(
            Object value
    ) {
        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.intValue();
        }

        return Integer.valueOf(
                value.toString()
        );
    }

    private static LocalDate toLocalDate(
            Object value
    ) {
        if (value == null) {
            return null;
        }

        if (value instanceof LocalDate date) {
            return date;
        }

        return LocalDate.parse(
                value.toString()
        );
    }

    private static LocalDateTime toLocalDateTime(
            Object value
    ) {
        if (value == null) {
            return null;
        }

        if (value instanceof LocalDateTime dateTime) {
            return dateTime;
        }

        return LocalDateTime.parse(
                value.toString()
        );
    }

    public record ApplyRequest(
            UUID jobId
    ) {
    }

    public record ApplyResponse(
            UUID applicationId,
            UUID jobId,
            UUID candidateId,
            String status
    ) {
    }

    public record CandidateJobResponse(
            UUID id,
            UUID companyId,
            String companyName,
            String title,
            String department,
            String description,
            String location,
            String workplaceType,
            String employmentType,
            BigDecimal salaryMin,
            BigDecimal salaryMax,
            String salaryCurrency,
            boolean salaryNegotiable,
            String qualifications,
            String experienceRequired,
            List<String> skills,
            String responsibilities,
            String benefits,
            Integer openings,
            LocalDate applicationDeadline,
            String status,
            LocalDateTime createdAt
    ) {
    }
}
