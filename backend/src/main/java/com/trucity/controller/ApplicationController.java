package com.trucity.controller;

import com.trucity.application.ApplicationResponse;
import com.trucity.application.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import com.trucity.application.ApplicationResponseService;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ApplicationResponseService applicationResponseService;


    /*
     * =========================================================
     * GET ALL APPLICATIONS
     * =========================================================
     *
     * URL:
     *
     * GET /api/applications
     *
     * Used by admin/general application views.
     *
     * =========================================================
     */

    @GetMapping
    public List<ApplicationResponse> getAllApplications() {

        return applicationService.getAllApplications();
    }


    /*
     * =========================================================
     * GET LOGGED-IN EMPLOYER PIPELINE
     * =========================================================
     */

    @GetMapping("/company-pipeline")
    @PreAuthorize("hasRole('EMPLOYER')")
    public List<ApplicationService.CompanyPipelineResponse>
    getCompanyPipeline(
            Authentication authentication
    ) {

        if (authentication == null ||
            authentication.getName() == null ||
            authentication.getName().isBlank()) {

            throw new IllegalStateException(
                    "Authenticated employer could not be identified."
            );
        }

        return applicationService.getCompanyPipeline(
                authentication.getName()
        );
    }


    /*
     * =========================================================
     * UPDATE PIPELINE STAGE
     * =========================================================
     */

    @PatchMapping(
            "/company-pipeline/{applicationId}/stage"
    )
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('EMPLOYER')")
    public void updatePipelineStage(

            @PathVariable UUID applicationId,

            @RequestParam String stage,

            Authentication authentication
    ) {

        if (authentication == null ||
            authentication.getName() == null ||
            authentication.getName().isBlank()) {

            throw new IllegalStateException(
                    "Authenticated employer could not be identified."
            );
        }

        applicationService.updatePipelineStage(
                applicationId,
                stage,
                authentication.getName()
        );
    }
    /*
     * =========================================================
     * GET APPLICATION QUESTION RESPONSES
     * =========================================================
    */

    @GetMapping(
            "/company-pipeline/{applicationId}/responses"
    )
    @PreAuthorize("hasRole('EMPLOYER')")
    public List<ApplicationResponseService.ApplicationAnswerResponse>
    getApplicationResponses(
            @PathVariable UUID applicationId,
            Authentication authentication
    ) {

        if (
                authentication == null ||
                authentication.getName() == null ||
                authentication.getName().isBlank()
        ) {

            throw new IllegalStateException(
                    "Authenticated employer could not be identified."
            );
        }

        return applicationResponseService.getResponses(
                applicationId,
                authentication.getName()
        );
    }

}
