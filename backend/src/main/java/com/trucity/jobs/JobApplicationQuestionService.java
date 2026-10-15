package com.trucity.jobs;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobApplicationQuestionService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
        "TEXT",
        "TEXTAREA",
        "YES_NO",
        "SINGLE_SELECT",
        "MULTI_SELECT",
        "NUMBER"
    );

    private final JobApplicationQuestionRepository questionRepository;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<QuestionResponse> getQuestions(
        String authenticatedEmail,
        UUID jobId
    ) {
        requireJobOwnership(authenticatedEmail, jobId);

        return questionRepository
            .findAllByJobIdAndActiveTrueOrderByDisplayOrderAsc(jobId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    /**
     * Synchronizes the complete question list submitted by an employer.
     *
     * Existing IDs are updated.
     * Missing IDs are inserted.
     * Existing questions omitted from the submitted list are removed.
     */
    @Transactional
    public List<QuestionResponse> saveQuestions(
        String authenticatedEmail,
        UUID jobId,
        List<QuestionRequest> requests
    ) {
        requireJobOwnership(authenticatedEmail, jobId);

        if (requests == null) {
            throw new IllegalArgumentException(
                "Provide a question list. Use an empty list to remove all questions."
            );
        }

        if (requests.size() > 30) {
            throw new IllegalArgumentException(
                "A job can have at most 30 application questions."
            );
        }

        List<JobApplicationQuestion> existing =
            questionRepository.findAllByJobIdOrderByDisplayOrderAsc(jobId);

        Set<UUID> existingIds = new HashSet<>();

        for (JobApplicationQuestion question : existing) {
            existingIds.add(question.getId());
        }

        Set<UUID> submittedIds = new HashSet<>();
        List<JobApplicationQuestion> toSave = new ArrayList<>();

        for (int index = 0; index < requests.size(); index++) {
            QuestionRequest request = requests.get(index);
            validateQuestion(request);

            JobApplicationQuestion question;

            if (request.id() != null) {
                if (!existingIds.contains(request.id())) {
                    throw new IllegalArgumentException(
                        "A question ID does not belong to this job."
                    );
                }

                if (!submittedIds.add(request.id())) {
                    throw new IllegalArgumentException(
                        "The same question ID was provided more than once."
                    );
                }

                question = questionRepository
                    .findByIdAndJobId(request.id(), jobId)
                    .orElseThrow(() -> new IllegalArgumentException(
                        "A question was not found for this job."
                    ));
            } else {
                question = new JobApplicationQuestion();
                question.setJobId(jobId);
            }

            question.setQuestionText(request.questionText().trim());
            question.setQuestionType(normalizeType(request.questionType()));
            question.setRequired(request.required());
            question.setOptions(optionsToJson(request.options()));
            question.setDisplayOrder(index);
            question.setActive(true);

            toSave.add(question);
        }

        /*
         * Persist additions and updates before removing omitted questions.
         * All operations participate in the same transaction.
         */
        List<JobApplicationQuestion> saved =
            questionRepository.saveAll(toSave);

        questionRepository.flush();

        /*
         * Delete only existing questions whose IDs were not submitted.
         * Newly created questions are not in 'existing', so they cannot
         * accidentally be deleted here.
         */
        List<JobApplicationQuestion> removed = existing.stream()
            .filter(question -> !submittedIds.contains(question.getId()))
            .toList();

        if (!removed.isEmpty()) {
            questionRepository.deleteAll(removed);
            questionRepository.flush();
        }

        return saved.stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public void deleteQuestion(
        String authenticatedEmail,
        UUID jobId,
        UUID questionId
    ) {
        requireJobOwnership(authenticatedEmail, jobId);

        JobApplicationQuestion question = questionRepository
            .findByIdAndJobId(questionId, jobId)
            .orElseThrow(() -> new QuestionNotFoundException(
                "The question was not found for this job."
            ));

        questionRepository.delete(question);
    }
    /**
 * Retrieves active application questions for a candidate.
 *
 * Unlike the employer method, this does not require job ownership.
 * The candidate endpoint is responsible for enforcing access control.
 */
    @Transactional(readOnly = true)
    public List<QuestionResponse> getCandidateQuestions(UUID jobId) {

    if (jobId == null) {
        throw new IllegalArgumentException("Job ID is required.");
    }

    return questionRepository
        .findAllByJobIdAndActiveTrueOrderByDisplayOrderAsc(jobId)
        .stream()
        .map(this::toResponse)
        .toList();
}

    private void requireJobOwnership(String email, UUID jobId) {
        Integer count = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM jobs j
            JOIN employer_profiles ep ON ep.company_id = j.company_id
            JOIN users u ON u.id = ep.user_id
            WHERE j.id = ?
              AND LOWER(u.email) = LOWER(?)
            """,
            Integer.class,
            jobId,
            email
        );

        if (count == null || count == 0) {
            throw new JobNotOwnedException(
                "The job was not found or does not belong to your company."
            );
        }
    }

    private void validateQuestion(QuestionRequest request) {
        if (request == null) {
            throw new IllegalArgumentException(
                "Question entries cannot be null."
            );
        }

        if (request.questionText() == null
            || request.questionText().isBlank()) {
            throw new IllegalArgumentException(
                "Every question needs question text."
            );
        }

        if (request.questionText().trim().length() > 2000) {
            throw new IllegalArgumentException(
                "Question text must not exceed 2000 characters."
            );
        }

        String type = normalizeType(request.questionType());

        List<String> options = request.options() == null
            ? List.of()
            : request.options();

        if ((type.equals("SINGLE_SELECT")
            || type.equals("MULTI_SELECT"))
            && options.size() < 2) {
            throw new IllegalArgumentException(
                "Choice questions must have at least two options."
            );
        }

        if (options.size() > 50) {
            throw new IllegalArgumentException(
                "A question can have at most 50 options."
            );
        }

        Set<String> uniqueOptions = new HashSet<>();

        for (String option : options) {
            if (option == null || option.isBlank()) {
                throw new IllegalArgumentException(
                    "Question options cannot be blank."
                );
            }

            if (option.trim().length() > 300) {
                throw new IllegalArgumentException(
                    "Question options must not exceed 300 characters."
                );
            }

            if (!uniqueOptions.add(option.trim())) {
                throw new IllegalArgumentException(
                    "Question options cannot contain duplicates."
                );
            }
        }
    }

    private String normalizeType(String type) {
        String normalized = type == null || type.isBlank()
            ? "TEXT"
            : type.trim().toUpperCase(Locale.ROOT);

        if (!ALLOWED_TYPES.contains(normalized)) {
            throw new IllegalArgumentException(
                "Unsupported question type: " + normalized
            );
        }

        return normalized;
    }

    private JsonNode optionsToJson(List<String> options) {
        List<String> safeOptions = options == null
            ? List.of()
            : options.stream()
                .map(String::trim)
                .distinct()
                .toList();

        return objectMapper.valueToTree(safeOptions);
    }

    private QuestionResponse toResponse(
        JobApplicationQuestion question
    ) {
        List<String> options = new ArrayList<>();
        JsonNode node = question.getOptions();

        if (node != null && node.isArray()) {
            node.forEach(option -> {
                if (option.isTextual()) {
                    options.add(option.asText());
                }
            });
        }

        return new QuestionResponse(
            question.getId(),
            question.getQuestionText(),
            question.getQuestionType(),
            question.isRequired(),
            options,
            question.getDisplayOrder()
        );
    }

    public record QuestionRequest(
        UUID id,
        String questionText,
        String questionType,
        boolean required,
        List<String> options
    ) {}

    public record QuestionResponse(
        UUID id,
        String questionText,
        String questionType,
        boolean required,
        List<String> options,
        int displayOrder
    ) {}

    public static class JobNotOwnedException
        extends RuntimeException {
        public JobNotOwnedException(String message) {
            super(message);
        }
    }

    public static class QuestionNotFoundException
        extends RuntimeException {
        public QuestionNotFoundException(String message) {
            super(message);
        }
    }
}