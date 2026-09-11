package com.trucity.application;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApplicationService {

    @PersistenceContext
    private EntityManager entityManager;


    /*
     * =========================================================
     * GET ALL APPLICATIONS
     * =========================================================
     */

    public List<ApplicationResponse> getAllApplications() {

        List<?> rawRows = entityManager
                .createNativeQuery("""
                        SELECT
                            a.id,

                            a.candidate_id,

                            CONCAT(
                                COALESCE(u.first_name, ''),
                                CASE
                                    WHEN u.first_name IS NOT NULL
                                     AND u.last_name IS NOT NULL
                                    THEN ' '
                                    ELSE ''
                                END,
                                COALESCE(u.last_name, '')
                            ) AS candidate_name,

                            u.email,

                            a.job_id,

                            j.title AS job_title,

                            c.id AS company_id,

                            c.name AS company_name,

                            a.status,

                            a.applied_at

                        FROM applications a

                        LEFT JOIN candidate_profiles cp
                            ON cp.id = a.candidate_id

                        LEFT JOIN users u
                            ON u.id = cp.user_id

                        LEFT JOIN jobs j
                            ON j.id = a.job_id

                        LEFT JOIN companies c
                            ON c.id = j.company_id

                        ORDER BY a.applied_at DESC
                        """)
                .getResultList();

        List<ApplicationResponse> applications = new ArrayList<>();

        for (Object result : rawRows) {

            Object[] row = (Object[]) result;

            UUID id = toUuid(row[0]);
            UUID candidateId = toUuid(row[1]);

            String candidateName = toStringValue(row[2]).trim();

            if (candidateName.isBlank()) {
                candidateName = "Unknown Candidate";
            }

            String email = toStringValue(row[3]);

            UUID jobId = toUuid(row[4]);

            String jobTitle = toStringValue(row[5]);

            if (jobTitle.isBlank()) {
                jobTitle = "Unknown Job";
            }

            UUID companyId = toUuid(row[6]);

            String companyName = toStringValue(row[7]);

            if (companyName.isBlank()) {
                companyName = "Unknown Company";
            }

            String status = toStringValue(row[8]).trim();

            if (status.isBlank()) {
                status = "SUBMITTED";
            }

            LocalDateTime appliedAt = toLocalDateTime(row[9]);

            applications.add(
                    new ApplicationResponse(
                            id,
                            candidateId,
                            candidateName,
                            email,
                            jobId,
                            jobTitle,
                            companyId,
                            companyName,
                            status,
                            appliedAt
                    )
            );
        }

        return applications;
    }


    /*
     * =========================================================
     * GET LOGGED-IN EMPLOYER PIPELINE
     * =========================================================
     *
     * Authentication.getName() supplies the employer email.
     *
     * Relationship:
     *
     * users
     *   ↓
     * employer_profiles
     *   ↓
     * companies
     *   ↓
     * jobs
     *   ↓
     * applications
     *   ↓
     * candidate_profiles
     *
     * The EXISTS clause ensures that only applications for jobs
     * belonging to the authenticated employer's company are
     * returned.
     *
     * =========================================================
     */

    public List<CompanyPipelineResponse> getCompanyPipeline(
            String employerEmail
    ) {

        if (employerEmail == null || employerEmail.isBlank()) {
            return Collections.emptyList();
        }

        String email = employerEmail.trim();

        List<?> rawRows = entityManager
                .createNativeQuery("""
                        SELECT
                            a.id AS application_id,

                            a.candidate_id,

                            cp.user_id,

                            COALESCE(u.first_name, '') AS first_name,

                            COALESCE(u.last_name, '') AS last_name,

                            CONCAT(
                                COALESCE(u.first_name, ''),
                                CASE
                                    WHEN u.first_name IS NOT NULL
                                     AND u.last_name IS NOT NULL
                                    THEN ' '
                                    ELSE ''
                                END,
                                COALESCE(u.last_name, '')
                            ) AS candidate_name,

                            COALESCE(u.email, '') AS email,

                            COALESCE(cp.headline, '') AS headline,

                            COALESCE(cp.location, '') AS location,

                            COALESCE(cp.bio, '') AS bio,

                            COALESCE(cp.years_experience, 0) AS years_experience,

                            false AS verified,

                            COALESCE(a.status, 'SUBMITTED') AS application_status,

                            a.job_id,

                            COALESCE(j.title, 'Unknown Job') AS job_title,

                            a.applied_at

                        FROM applications a

                        INNER JOIN candidate_profiles cp
                            ON cp.id = a.candidate_id

                        INNER JOIN users u
                            ON u.id = cp.user_id

                        INNER JOIN jobs j
                            ON j.id = a.job_id

                        WHERE EXISTS (
                            SELECT 1
                            FROM employer_profiles ep
                            INNER JOIN users employer_user
                                ON employer_user.id = ep.user_id
                            WHERE ep.company_id = j.company_id
                              AND LOWER(employer_user.email) =
                                  LOWER(:employerEmail)
                        )

                        ORDER BY a.applied_at DESC
                        """)
                .setParameter("employerEmail", email)
                .getResultList();

        List<CompanyPipelineResponse> pipeline = new ArrayList<>();

        for (Object result : rawRows) {

            Object[] row = (Object[]) result;

            UUID applicationId = toUuid(row[0]);

            UUID candidateId = toUuid(row[1]);

            UUID userId = toUuid(row[2]);

            String firstName = toStringValue(row[3]).trim();

            String lastName = toStringValue(row[4]).trim();

            String candidateName = toStringValue(row[5]).trim();

            if (candidateName.isBlank()) {
                candidateName =
                        (firstName + " " + lastName).trim();
            }

            if (candidateName.isBlank()) {
                candidateName = "Unknown Candidate";
            }

            String emailValue = toStringValue(row[6]).trim();

            String headline = toStringValue(row[7]).trim();

            String location = toStringValue(row[8]).trim();

            String bio = toStringValue(row[9]).trim();

            int yearsExperience = toInt(row[10]);

            /*
             * candidate_profiles currently has no verified column.
             *
             * Keep the API field available for the frontend, but
             * safely default it to false until verification is stored
             * somewhere in the database.
             */
            boolean verified = toBoolean(row[11]);

            String applicationStatus =
                    toStringValue(row[12]).trim().toUpperCase();

            if (applicationStatus.isBlank()) {
                applicationStatus = "SUBMITTED";
            }

            UUID jobId = toUuid(row[13]);

            String jobTitle = toStringValue(row[14]).trim();

            if (jobTitle.isBlank()) {
                jobTitle = "Unknown Job";
            }

            LocalDateTime appliedAt =
                    toLocalDateTime(row[15]);

            String stage =
                    applicationStatusToStage(applicationStatus);

            String category =
                    inferCategory(headline);

            String candidateStatus =
                    inferCandidateStatus(applicationStatus);

            pipeline.add(
                    new CompanyPipelineResponse(
                            applicationId,
                            candidateId,
                            userId,
                            firstName,
                            lastName,
                            candidateName,
                            emailValue,
                            headline,
                            category,
                            location,
                            bio,
                            yearsExperience,
                            verified,
                            Collections.emptyList(),
                            candidateStatus,
                            jobId,
                            jobTitle,
                            applicationStatus,
                            stage,
                            appliedAt
                    )
            );
        }

        return pipeline;
    }


    /*
     * =========================================================
     * UPDATE APPLICATION PIPELINE STAGE
     * =========================================================
     */

    @Transactional
    public void updatePipelineStage(
            UUID applicationId,
            String stage,
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

        String databaseStatus =
                stageToApplicationStatus(stage);

        int updatedRows = entityManager
                .createNativeQuery("""
                        UPDATE applications a

                        SET status = :status

                        FROM jobs j

                        WHERE a.job_id = j.id

                          AND a.id = :applicationId

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
                .setParameter("status", databaseStatus)
                .setParameter("applicationId", applicationId)
                .setParameter(
                        "employerEmail",
                        employerEmail.trim()
                )
                .executeUpdate();

        if (updatedRows == 0) {
            throw new IllegalArgumentException(
                    "Application not found or does not belong to the logged-in employer."
            );
        }
    }


    /*
     * =========================================================
     * STATUS → PIPELINE STAGE
     * =========================================================
     */

    private String applicationStatusToStage(
            String status
    ) {

        if (status == null) {
            return "sourced";
        }

        return switch (status.trim().toUpperCase()) {

            case "SHORTLISTED" ->
                    "shortlisted";

            case "INTERVIEWING",
                 "INTERVIEW" ->
                    "interviewing";

            case "OFFERED",
                 "OFFER" ->
                    "offered";

            case "REJECTED" ->
                    "rejected";

            case "SUBMITTED",
                 "UNDER_REVIEW",
                 "APPLIED" ->
                    "sourced";

            default ->
                    "sourced";
        };
    }


    /*
     * =========================================================
     * PIPELINE STAGE → DATABASE STATUS
     * =========================================================
     */

    private String stageToApplicationStatus(
            String stage
    ) {

        if (stage == null || stage.isBlank()) {
            throw new IllegalArgumentException(
                    "Pipeline stage is required."
            );
        }

        return switch (stage.trim().toLowerCase()) {

            case "sourced" ->
                    "SUBMITTED";

            case "shortlisted" ->
                    "SHORTLISTED";

            case "interviewing" ->
                    "INTERVIEWING";

            case "offered" ->
                    "OFFERED";

            case "rejected" ->
                    "REJECTED";

            default ->
                    throw new IllegalArgumentException(
                            "Invalid pipeline stage: " + stage
                    );
        };
    }


    /*
     * =========================================================
     * CATEGORY INFERENCE
     * =========================================================
     */

    private String inferCategory(
            String headline
    ) {

        if (headline == null || headline.isBlank()) {
            return "Other";
        }

        String value = headline.toLowerCase();

        if (
                value.contains("devops") ||
                value.contains("cloud") ||
                value.contains("aws") ||
                value.contains("azure") ||
                value.contains("docker") ||
                value.contains("kubernetes")
        ) {
            return "DevOps & Cloud";
        }

        if (
                value.contains("data") ||
                value.contains("machine learning") ||
                value.contains(" ml") ||
                value.contains("artificial intelligence") ||
                value.contains(" ai") ||
                value.contains("python")
        ) {
            return "Data & AI";
        }

        if (
                value.contains("design") ||
                value.contains("designer") ||
                value.contains("ui") ||
                value.contains("ux")
        ) {
            return "Design";
        }

        if (
                value.contains("java") ||
                value.contains("react") ||
                value.contains("developer") ||
                value.contains("software") ||
                value.contains("frontend") ||
                value.contains("backend") ||
                value.contains("engineer")
        ) {
            return "Software Engineering";
        }

        return "Other";
    }


    /*
     * =========================================================
     * CANDIDATE STATUS
     * =========================================================
     */

    private String inferCandidateStatus(
            String applicationStatus
    ) {

        if (applicationStatus == null) {
            return "In Review";
        }

        return switch (
                applicationStatus.trim().toUpperCase()
        ) {

            case "INTERVIEWING",
                 "INTERVIEW" ->
                    "Interviewing";

            case "OFFERED",
                 "OFFER" ->
                    "Hired";

            case "REJECTED" ->
                    "Unavailable";

            default ->
                    "In Review";
        };
    }


    /*
     * =========================================================
     * SAFE UUID CONVERSION
     * =========================================================
     */

    private UUID toUuid(
            Object value
    ) {

        if (value == null) {
            return null;
        }

        if (value instanceof UUID uuid) {
            return uuid;
        }

        try {
            return UUID.fromString(value.toString());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }


    /*
     * =========================================================
     * SAFE STRING CONVERSION
     * =========================================================
     */

    private String toStringValue(
            Object value
    ) {

        return value != null
                ? value.toString()
                : "";
    }


    /*
     * =========================================================
     * SAFE INTEGER CONVERSION
     * =========================================================
     */

    private int toInt(
            Object value
    ) {

        if (value == null) {
            return 0;
        }

        if (value instanceof Number number) {
            return number.intValue();
        }

        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            return 0;
        }
    }


    /*
     * =========================================================
     * SAFE BOOLEAN CONVERSION
     * =========================================================
     */

    private boolean toBoolean(
            Object value
    ) {

        if (value == null) {
            return false;
        }

        if (value instanceof Boolean booleanValue) {
            return booleanValue;
        }

        return Boolean.parseBoolean(value.toString());
    }


    /*
     * =========================================================
     * SAFE DATETIME CONVERSION
     * =========================================================
     */

    private LocalDateTime toLocalDateTime(
            Object value
    ) {

        if (value instanceof LocalDateTime localDateTime) {
            return localDateTime;
        }

        if (value == null) {
            return null;
        }

        if (value instanceof java.sql.Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }

        try {
            return LocalDateTime.parse(value.toString());
        } catch (Exception e) {
            return null;
        }
    }


    /*
     * =========================================================
     * PIPELINE RESPONSE
     * =========================================================
     */

    public record CompanyPipelineResponse(

            UUID applicationId,

            UUID candidateId,

            UUID userId,

            String firstName,

            String lastName,

            String name,

            String email,

            String headline,

            String category,

            String location,

            String bio,

            int yearsExperience,

            boolean verified,

            List<String> skills,

            String status,

            UUID jobId,

            String jobTitle,

            String applicationStatus,

            String stage,

            LocalDateTime appliedAt

    ) {}
}
