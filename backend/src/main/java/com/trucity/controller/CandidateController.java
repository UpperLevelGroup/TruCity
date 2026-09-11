package com.trucity.controller;

import com.trucity.candidate.CandidateResponse;
import com.trucity.candidate.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/company/candidates")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public List<CandidateResponse> getCandidates(
            Authentication authentication
    ) {

        return candidateService.getCandidates(authentication);
    }
}