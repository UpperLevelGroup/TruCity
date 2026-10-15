package com.trucity.applicationwizard;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidate")
@RequiredArgsConstructor
public class CandidateApplicationWizardController {

    private final CandidateApplicationWizardService wizardService;

    /**
     * Candidate-safe read-only endpoint. The employer-only question-management
     * endpoint remains protected separately.
     */
    @GetMapping("/jobs/{jobId}/application-questions")
    @PreAuthorize("hasRole('CANDIDATE')")
    public List<QuestionResponse> getQuestions(
            @PathVariable UUID jobId,
            Authentication authentication) {
        return wizardService.getQuestions(jobId, requireEmail(authentication));
    }

    /**
     * Final submit endpoint used only after the candidate reviews their answers
     * and CV. The existing POST /api/candidate/applications endpoint is left
     * untouched for backwards compatibility.
     */
    @PostMapping("/applications/submit")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CANDIDATE')")
    public SubmitApplicationResponse submit(
            @Valid @RequestBody SubmitApplicationRequest request,
            Authentication authentication) {
        return wizardService.submit(request, requireEmail(authentication));
    }

    private String requireEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null
                || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Unable to identify the signed-in candidate.");
        }
        return authentication.getName().trim();
    }

    public record QuestionResponse(
            UUID id,
            UUID jobId,
            String questionText,
            String questionType,
            boolean required,
            List<String> options,
            int displayOrder) {}

    public record SubmitApplicationRequest(
            @NotNull UUID jobId,
            UUID resumeId,
            String resumeTitle,
            JsonNode resumeSnapshot,
            @Size(max = 100) List<@Valid AnswerRequest> answers) {}

    public record AnswerRequest(
            @NotNull UUID questionId,
            String answerText,
            JsonNode answerJson) {}

    public record SubmitApplicationResponse(
            UUID applicationId,
            UUID jobId,
            UUID candidateId,
            UUID resumeId,
            String status,
            String message) {}
}
