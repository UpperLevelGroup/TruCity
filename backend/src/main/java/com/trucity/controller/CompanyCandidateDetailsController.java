package com.trucity.controller;

import com.trucity.company.CompanyCandidateDetailsResponse;
import com.trucity.company.CompanyCandidateDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/company/candidate-details")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CompanyCandidateDetailsController {

    private final CompanyCandidateDetailsService detailsService;

    @GetMapping("/{candidateId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public CompanyCandidateDetailsResponse getCandidateDetails(
            @PathVariable UUID candidateId,
            Authentication authentication
    ) {
        return detailsService.getCandidateDetails(
                candidateId,
                authentication.getName()
        );
    }
}
