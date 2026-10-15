package com.trucity.jobs;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs/company/{jobId}/application-questions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('EMPLOYER')")
public class JobApplicationQuestionController {

    private final JobApplicationQuestionService questionService;

    @GetMapping
    public List<JobApplicationQuestionService.QuestionResponse> getQuestions(
        Authentication authentication,
        @PathVariable UUID jobId
    ) {
        return questionService.getQuestions(
            authentication.getName(),
            jobId
        );
    }

    @PutMapping
    public List<JobApplicationQuestionService.QuestionResponse> saveQuestions(
        Authentication authentication,
        @PathVariable UUID jobId,
        @RequestBody List<JobApplicationQuestionService.QuestionRequest> requests
    ) {
        return questionService.saveQuestions(
            authentication.getName(),
            jobId,
            requests
        );
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuestion(
        Authentication authentication,
        @PathVariable UUID jobId,
        @PathVariable UUID questionId
    ) {
        questionService.deleteQuestion(
            authentication.getName(),
            jobId,
            questionId
        );

        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(JobApplicationQuestionService.JobNotOwnedException.class)
    public ResponseEntity<Map<String, String>> handleJobNotOwned(
        JobApplicationQuestionService.JobNotOwnedException exception
    ) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(JobApplicationQuestionService.QuestionNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleQuestionNotFound(
        JobApplicationQuestionService.QuestionNotFoundException exception
    ) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleInvalidRequest(
        IllegalArgumentException exception
    ) {
        return ResponseEntity.badRequest()
            .body(Map.of("message", exception.getMessage()));
    }
}