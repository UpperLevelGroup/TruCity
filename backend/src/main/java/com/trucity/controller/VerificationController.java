package com.trucity.controller;

import com.trucity.verification.VerificationResponse;
import com.trucity.verification.VerificationReviewRequest;
import com.trucity.verification.VerificationService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/verifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class VerificationController {

    private final VerificationService verificationService;


    /*
     * =========================================================
     * GET ALL
     * =========================================================
     */

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<VerificationResponse> getAllVerifications() {

        return verificationService
                .getAllVerifications();
    }


    /*
     * =========================================================
     * GET SINGLE
     * =========================================================
     */

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public VerificationResponse getVerification(
            @PathVariable UUID id
    ) {

        return verificationService
                .getVerificationById(id);
    }


    /*
     * =========================================================
     * REVIEW
     * =========================================================
     */

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public VerificationResponse reviewVerification(

            @PathVariable UUID id,

            @RequestBody
            VerificationReviewRequest request,

            Authentication authentication

    ) {

        String verifierName =
                authentication != null
                        ? authentication.getName()
                        : "ADMIN";


        return verificationService.reviewVerification(
                id,
                request,
                verifierName
        );
    }
}