package com.trucity.candidate;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidate/resumes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CANDIDATE')")
public class CandidateResumeController {

    private final CandidateResumeService resumeService;

    @GetMapping
    public List<CandidateResumeService.ResumeResponse> list(
        Authentication authentication
    ) {
        return resumeService.listResumes(authentication.getName());
    }

    @GetMapping("/{resumeId}")
    public CandidateResumeService.ResumeResponse get(
        Authentication authentication,
        @PathVariable UUID resumeId
    ) {
        return resumeService.getResume(
            authentication.getName(),
            resumeId
        );
    }

    @PostMapping
    public ResponseEntity<CandidateResumeService.ResumeResponse> create(
        Authentication authentication,
        @RequestBody CandidateResumeService.SaveResumeRequest request
    ) {
        CandidateResumeService.ResumeResponse created =
            resumeService.createResume(authentication.getName(), request);

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{resumeId}")
    public CandidateResumeService.ResumeResponse update(
        Authentication authentication,
        @PathVariable UUID resumeId,
        @RequestBody CandidateResumeService.SaveResumeRequest request
    ) {
        return resumeService.updateResume(
            authentication.getName(),
            resumeId,
            request
        );
    }

    @PutMapping("/{resumeId}/default")
    public CandidateResumeService.ResumeResponse setDefault(
        Authentication authentication,
        @PathVariable UUID resumeId
    ) {
        return resumeService.setDefaultResume(
            authentication.getName(),
            resumeId
        );
    }

    @DeleteMapping("/{resumeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
        Authentication authentication,
        @PathVariable UUID resumeId
    ) {
        resumeService.deleteResume(
            authentication.getName(),
            resumeId
        );
    }

    @ExceptionHandler(CandidateResumeService.ResumeNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleResumeNotFound(
        RuntimeException exception
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

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleCandidateProfileMissing(
        IllegalStateException exception
    ) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("message", exception.getMessage()));
    }
}