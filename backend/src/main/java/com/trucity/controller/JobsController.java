package com.trucity.controller;

import com.trucity.jobs.CreateCompanyJobRequest;
import com.trucity.jobs.JobStatusRequest;
import com.trucity.jobs.JobsResponse;
import com.trucity.jobs.JobsService;
import com.trucity.jobs.UpdateCompanyJobRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class JobsController {


    private final JobsService jobsService;


    /*
    |--------------------------------------------------------------------------
    | ADMIN
    |--------------------------------------------------------------------------
    */

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<JobsResponse> getAllJobs() {

        return jobsService.getAllJobs();
    }

        /*
    |--------------------------------------------------------------------------
    | CANDIDATE — OPEN JOBS
    |--------------------------------------------------------------------------
    */

     @GetMapping("/open")
     @PreAuthorize("hasRole('CANDIDATE')")
     public List<JobsResponse> getOpenJobs() {
     
        return jobsService.getOpenJobs();
     }

    /*
    |--------------------------------------------------------------------------
    | EMPLOYER — ALL COMPANY JOBS
    |--------------------------------------------------------------------------
    */

    @GetMapping("/company")
    @PreAuthorize("hasRole('EMPLOYER')")
    public List<JobsResponse> getCompanyJobs(
            Authentication authentication
    ) {

        return jobsService.getCompanyJobs(
                authentication
        );
    }


    /*
    |--------------------------------------------------------------------------
    | EMPLOYER — SINGLE JOB
    |--------------------------------------------------------------------------
    */

    @GetMapping("/company/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public JobsResponse getCompanyJob(
            @PathVariable UUID id,
            Authentication authentication
    ) {

        return jobsService.getCompanyJob(
                id,
                authentication
        );
    }


    /*
    |--------------------------------------------------------------------------
    | EMPLOYER — CREATE
    |--------------------------------------------------------------------------
    */

    @PostMapping("/company")
    @PreAuthorize("hasRole('EMPLOYER')")
    @ResponseStatus(HttpStatus.CREATED)
    public JobsResponse createCompanyJob(
            @RequestBody CreateCompanyJobRequest request,
            Authentication authentication
    ) {

        return jobsService.createCompanyJob(
                request,
                authentication
        );
    }


    /*
    |--------------------------------------------------------------------------
    | EMPLOYER — UPDATE
    |--------------------------------------------------------------------------
    */

    @PutMapping("/company/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public JobsResponse updateCompanyJob(
            @PathVariable UUID id,
            @RequestBody UpdateCompanyJobRequest request,
            Authentication authentication
    ) {

        return jobsService.updateCompanyJob(
                id,
                request,
                authentication
        );
    }


    /*
    |--------------------------------------------------------------------------
    | EMPLOYER — CLOSE
    |--------------------------------------------------------------------------
    */

    @PatchMapping("/company/{id}/close")
    @PreAuthorize("hasRole('EMPLOYER')")
    public JobsResponse closeCompanyJob(
            @PathVariable UUID id,
            Authentication authentication
    ) {

        return jobsService.closeCompanyJob(
                id,
                authentication
        );
    }


    /*
    |--------------------------------------------------------------------------
    | EMPLOYER — DELETE
    |--------------------------------------------------------------------------
    */

    @DeleteMapping("/company/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCompanyJob(
            @PathVariable UUID id,
            Authentication authentication
    ) {

        jobsService.deleteCompanyJob(
                id,
                authentication
        );
    }


    /*
    |--------------------------------------------------------------------------
    | ADMIN — UPDATE STATUS
    |--------------------------------------------------------------------------
    */

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public JobsResponse updateJobStatus(
            @PathVariable UUID id,
            @RequestBody JobStatusRequest request,
            Authentication authentication
    ) {

        return jobsService.updateJobStatus(
                id,
                request.status(),
                authentication
        );
    }
    


}