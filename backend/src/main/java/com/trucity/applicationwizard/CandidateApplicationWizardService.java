package com.trucity.applicationwizard;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import static com.trucity.applicationwizard.CandidateApplicationWizardController.*;

@Service
@RequiredArgsConstructor
public class CandidateApplicationWizardService {

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<QuestionResponse> getQuestions(UUID jobId, String email) {
        requireCandidateId(email);
        requireOpenJob(jobId);

        return jdbc.query("""
                SELECT
                    id,
                    job_id,
                    question_text,
                    question_type,
                    is_required AS required,
                    COALESCE(options, '[]'::jsonb)::text AS options_json,
                    display_order
                FROM public.job_application_questions
                WHERE job_id = ?
                  AND is_active = TRUE
                ORDER BY display_order ASC, created_at ASC
                """,
                (rs, rowNum) -> new QuestionResponse(
                        rs.getObject("id", UUID.class),
                        rs.getObject("job_id", UUID.class),
                        rs.getString("question_text"),
                        rs.getString("question_type"),
                        rs.getBoolean("required"),
                        readStringList(rs.getString("options_json")),
                        rs.getInt("display_order")),
                jobId);
    }

    @Transactional
    public SubmitApplicationResponse submit(
            SubmitApplicationRequest request,
            String email) {

        UUID candidateId = requireCandidateId(email);
        JobInfo job = requireOpenJob(request.jobId());

        Integer duplicate = jdbc.queryForObject("""
                SELECT COUNT(*)
                FROM public.applications
                WHERE job_id = ?
                  AND candidate_id = ?
                """,
                Integer.class,
                request.jobId(),
                candidateId);

        if (duplicate != null && duplicate > 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already applied for this position.");
        }

        UUID resumeId;
        JsonNode resumeSnapshot;

        if (request.resumeId() != null) {
            Map<String, Object> resume =
                    queryResumeForCandidate(request.resumeId(), candidateId);

            resumeId = request.resumeId();
            resumeSnapshot = parseJson(
                    (String) resume.get("structured_data"));
        } else {
            resumeSnapshot = request.resumeSnapshot();

            if (resumeSnapshot == null
                    || resumeSnapshot.isNull()
                    || !resumeSnapshot.isObject()
                    || resumeSnapshot.isEmpty()) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Choose a saved CV or provide the completed job-specific CV.");
            }

            String title = request.resumeTitle() == null
                    || request.resumeTitle().isBlank()
                    ? "Application CV — " + job.title()
                    : request.resumeTitle().trim();

            resumeId = jdbc.queryForObject("""
                    INSERT INTO public.candidate_resumes
                        (
                            candidate_id,
                            title,
                            professional_title,
                            structured_data,
                            is_default,
                            created_at,
                            updated_at
                        )
                    VALUES (?, ?, ?, ?::jsonb, FALSE,
                            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    RETURNING id
                    """,
                    UUID.class,
                    candidateId,
                    title,
                    textValue(resumeSnapshot, "professionalTitle"),
                    toJson(resumeSnapshot));
        }

        Map<UUID, QuestionData> questionMap =
                loadQuestions(request.jobId());

        List<AnswerRequest> submittedAnswers =
                request.answers() == null
                        ? List.of()
                        : request.answers();

        Set<UUID> seen = new HashSet<>();

        for (AnswerRequest answer : submittedAnswers) {
            if (answer == null || answer.questionId() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Each answer must identify its application question.");
            }

            if (!seen.add(answer.questionId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "A question was answered more than once.");
            }

            QuestionData question =
                    questionMap.get(answer.questionId());

            if (question == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "One of the questions no longer belongs to this job. Refresh and try again.");
            }

            validateAnswer(question, answer);
        }

        for (QuestionData question : questionMap.values()) {
            if (question.required()
                    && !seen.contains(question.id())) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Please answer the required question: "
                                + question.questionText());
            }
        }

        UUID applicationId = jdbc.queryForObject("""
                INSERT INTO public.applications
                    (
                        id,
                        job_id,
                        candidate_id,
                        status,
                        applied_at,
                        selected_resume_id,
                        resume_snapshot
                    )
                VALUES (
                    gen_random_uuid(),
                    ?, ?, 'SUBMITTED',
                    CURRENT_TIMESTAMP, ?, ?::jsonb
                )
                RETURNING id
                """,
                UUID.class,
                request.jobId(),
                candidateId,
                resumeId,
                toJson(resumeSnapshot));

        for (AnswerRequest answer : submittedAnswers) {
            QuestionData question =
                    questionMap.get(answer.questionId());

            jdbc.update("""
                    INSERT INTO public.application_answers
                        (
                            id,
                            application_id,
                            question_id,
                            question_text_snapshot,
                            question_type_snapshot,
                            answer_text,
                            answer_json,
                            created_at
                        )
                    VALUES (
                        gen_random_uuid(),
                        ?, ?, ?, ?, ?, ?::jsonb,
                        CURRENT_TIMESTAMP
                    )
                    """,
                    applicationId,
                    question.id(),
                    question.questionText(),
                    question.questionType(),
                    normalizeAnswerText(answer),
                    answer.answerJson() == null
                            ? "null"
                            : toJson(answer.answerJson()));
        }

        return new SubmitApplicationResponse(
                applicationId,
                request.jobId(),
                candidateId,
                resumeId,
                "SUBMITTED",
                "Your application has been submitted successfully.");
    }

    private UUID requireCandidateId(String email) {
        List<UUID> ids = jdbc.query("""
                SELECT cp.id
                FROM public.candidate_profiles cp
                JOIN public.users u ON u.id = cp.user_id
                WHERE LOWER(u.email) = LOWER(?)
                LIMIT 1
                """,
                (rs, rowNum) -> rs.getObject(1, UUID.class),
                email);

        if (ids.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "The signed-in account does not have a candidate profile.");
        }

        return ids.get(0);
    }

    private JobInfo requireOpenJob(UUID jobId) {
        List<JobInfo> jobs = jdbc.query("""
                SELECT
                    id,
                    title,
                    status,
                    application_deadline
                FROM public.jobs
                WHERE id = ?
                LIMIT 1
                """,
                (rs, rowNum) -> new JobInfo(
                        rs.getObject("id", UUID.class),
                        rs.getString("title"),
                        rs.getString("status"),
                        rs.getObject(
                                "application_deadline",
                                LocalDate.class)),
                jobId);

        if (jobs.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "This job could not be found.");
        }

        JobInfo job = jobs.get(0);

        String status = job.status() == null
                ? ""
                : job.status().trim().toUpperCase(Locale.ROOT);

        if (!(status.equals("ACTIVE") || status.equals("OPEN"))) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Applications are not being accepted for this job.");
        }

        if (job.deadline() != null
                && job.deadline().isBefore(LocalDate.now())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The application deadline for this job has passed.");
        }

        return job;
    }

    private Map<String, Object> queryResumeForCandidate(
            UUID resumeId,
            UUID candidateId) {

        List<Map<String, Object>> rows = jdbc.queryForList("""
                SELECT id, structured_data::text AS structured_data
                FROM public.candidate_resumes
                WHERE id = ?
                  AND candidate_id = ?
                """,
                resumeId,
                candidateId);

        if (rows.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "That saved CV does not belong to your account.");
        }

        return rows.get(0);
    }

    private Map<UUID, QuestionData> loadQuestions(UUID jobId) {
        List<QuestionData> questions = jdbc.query("""
                SELECT
                    id,
                    question_text,
                    question_type,
                    is_required AS required,
                    COALESCE(options, '[]'::jsonb)::text AS options_json
                FROM public.job_application_questions
                WHERE job_id = ?
                  AND is_active = TRUE
                ORDER BY display_order ASC, created_at ASC
                """,
                (rs, rowNum) -> new QuestionData(
                        rs.getObject("id", UUID.class),
                        rs.getString("question_text"),
                        rs.getString("question_type"),
                        rs.getBoolean("required"),
                        readStringList(
                                rs.getString("options_json"))),
                jobId);

        return questions.stream().collect(
                Collectors.toMap(QuestionData::id, q -> q));
    }

    private void validateAnswer(
            QuestionData question,
            AnswerRequest answer) {

        String type = question.questionType()
                .toUpperCase(Locale.ROOT);

        JsonNode json = answer.answerJson();
        String text = answer.answerText();

        boolean empty = (text == null || text.isBlank())
                && (json == null
                    || json.isNull()
                    || (json.isTextual()
                        && json.asText().isBlank())
                    || (json.isArray()
                        && json.isEmpty()));

        if (question.required() && empty) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please answer the required question: "
                            + question.questionText());
        }

        if (empty) {
            return;
        }

        switch (type) {
            case "YES_NO" -> {
                String value = firstValue(text, json);

                if (!Set.of("YES", "NO", "TRUE", "FALSE")
                        .contains(value.toUpperCase(Locale.ROOT))) {

                    badAnswer(
                            question,
                            "Please select Yes or No.");
                }
            }

            case "SINGLE_SELECT" -> {
                String value = firstValue(text, json);

                if (!question.options().contains(value)) {
                    badAnswer(
                            question,
                            "Select one of the provided options.");
                }
            }

            case "MULTI_SELECT" -> {
                List<String> values = new ArrayList<>();

                if (json != null && json.isArray()) {
                    json.forEach(v -> values.add(v.asText()));
                } else if (text != null && !text.isBlank()) {
                    values.add(text);
                }

                if (values.stream()
                        .anyMatch(v -> !question.options().contains(v))) {

                    badAnswer(
                            question,
                            "One or more selected options are invalid.");
                }
            }

            case "NUMBER" -> {
                try {
                    new BigDecimal(firstValue(text, json));
                } catch (Exception ex) {
                    badAnswer(question, "Enter a valid number.");
                }
            }

            case "TEXT", "TEXTAREA" -> {
                if ((text == null || text.isBlank())
                        && (json == null || json.isNull())) {

                    badAnswer(question, "Enter an answer.");
                }
            }

            default -> badAnswer(
                    question,
                    "This question uses an unsupported answer type.");
        }
    }

    private void badAnswer(
            QuestionData question,
            String message) {

        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                message + " Question: " + question.questionText());
    }

    private String normalizeAnswerText(AnswerRequest answer) {
        if (answer.answerText() != null
                && !answer.answerText().isBlank()) {

            return answer.answerText().trim();
        }

        JsonNode node = answer.answerJson();

        if (node == null || node.isNull()) {
            return null;
        }

        if (node.isTextual()) {
            return node.asText();
        }

        return node.toString();
    }

    private String firstValue(String text, JsonNode json) {
        if (text != null && !text.isBlank()) {
            return text.trim();
        }

        if (json == null || json.isNull()) {
            return "";
        }

        if (json.isTextual()
                || json.isNumber()
                || json.isBoolean()) {

            return json.asText();
        }

        return json.toString();
    }

    private String textValue(JsonNode node, String field) {
        JsonNode value = node.get(field);

        return value == null || value.isNull()
                ? null
                : value.asText(null);
    }

    private String toJson(JsonNode node) {
        try {
            return objectMapper.writeValueAsString(node);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The CV or answer contains invalid JSON.");
        }
    }

    private JsonNode parseJson(String value) {
        try {
            return objectMapper.readTree(value);
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "A saved CV could not be read.");
        }
    }

    private List<String> readStringList(String json) {
        try {
            JsonNode node = objectMapper.readTree(
                    json == null ? "[]" : json);

            if (!node.isArray()) {
                return List.of();
            }

            List<String> values = new ArrayList<>();
            node.forEach(value -> values.add(value.asText()));

            return values;
        } catch (Exception ex) {
            return List.of();
        }
    }

    private record JobInfo(
            UUID id,
            String title,
            String status,
            LocalDate deadline) {}

    private record QuestionData(
            UUID id,
            String questionText,
            String questionType,
            boolean required,
            List<String> options) {}
}