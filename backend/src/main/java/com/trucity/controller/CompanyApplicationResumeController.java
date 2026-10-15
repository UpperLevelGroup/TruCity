package com.trucity.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications/company-pipeline")
public class CompanyApplicationResumeController {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public CompanyApplicationResumeController(
            JdbcTemplate jdbcTemplate,
            ObjectMapper objectMapper
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public record ApplicationResumeResponse(
            UUID applicationId,
            UUID candidateId,
            UUID resumeId,
            JsonNode resume
    ) {}

    private record ResumeRow(
            UUID applicationId,
            UUID candidateId,
            UUID resumeId,
            String resumeSnapshot,
            String structuredData
    ) {}

    @GetMapping("/{applicationId}/resume")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ApplicationResumeResponse getApplicationResume(
            @PathVariable UUID applicationId,
            Authentication authentication
    ) {
        if (authentication == null
                || authentication.getName() == null
                || authentication.getName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication is required."
            );
        }

        String sql = """
                SELECT
                    a.id AS application_id,
                    a.candidate_id,
                    a.selected_resume_id AS resume_id,
                    CAST(a.resume_snapshot AS text) AS resume_snapshot,
                    CAST(cr.structured_data AS text) AS structured_data
                FROM public.applications a
                INNER JOIN public.jobs j
                    ON j.id = a.job_id
                LEFT JOIN public.candidate_resumes cr
                    ON cr.id = a.selected_resume_id
                   AND cr.candidate_id = a.candidate_id
                WHERE a.id = ?
                  AND EXISTS (
                      SELECT 1
                      FROM public.employer_profiles ep
                      INNER JOIN public.users u
                          ON u.id = ep.user_id
                      WHERE LOWER(u.email) = LOWER(?)
                        AND ep.company_id = j.company_id
                  )
                """;

        List<ResumeRow> rows = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new ResumeRow(
                        rs.getObject("application_id", UUID.class),
                        rs.getObject("candidate_id", UUID.class),
                        rs.getObject("resume_id", UUID.class),
                        rs.getString("resume_snapshot"),
                        rs.getString("structured_data")
                ),
                applicationId,
                authentication.getName()
        );

        if (rows.isEmpty()) {
            // Deliberately avoid revealing whether an application
            // belonging to another company exists.
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Application or resume not found."
            );
        }

        ResumeRow row = rows.get(0);

        String resumeJson = hasContent(row.resumeSnapshot())
                ? row.resumeSnapshot()
                : row.structuredData();

        JsonNode resume = parseResume(resumeJson);

        return new ApplicationResumeResponse(
                row.applicationId(),
                row.candidateId(),
                row.resumeId(),
                resume
        );
    }

    private boolean hasContent(String value) {
        return value != null && !value.isBlank();
    }

    private JsonNode parseResume(String json) {
        if (json == null || json.isBlank()) {
            return objectMapper.createObjectNode();
        }

        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "The saved application resume could not be read."
            );
        }
    }
}