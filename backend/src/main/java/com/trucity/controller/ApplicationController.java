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

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;


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
     *
     * URL:
     *
     * GET /api/applications/company-pipeline
     *
     * Authentication.getName() returns the authenticated
     * employer's email.
     *
     * The service then resolves:
     *
     * employer email
     *      ↓
     * employer_profiles
     *      ↓
     * company_id
     *      ↓
     * jobs
     *      ↓
     * applications
     *
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
     *
     * URL:
     *
     * PATCH
     * /api/applications/company-pipeline/{applicationId}/stage
     *
     * Example:
     *
     * PATCH
     * /api/applications/company-pipeline/
     * 80000000-0000-0000-0000-000000000001/stage
     * ?stage=shortlisted
     *
     * The service updates the database only if the application
     * belongs to the authenticated employer's company.
     *
     * The endpoint deliberately returns 204 NO CONTENT.
     *
     * The frontend should call GET /company-pipeline afterwards
     * to refresh the pipeline.
     *
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
}
