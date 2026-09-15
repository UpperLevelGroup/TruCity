package com.trucity.jobs;

import com.trucity.application.ApplicationRepository;
import com.trucity.audit.AuditService;
import com.trucity.company.Company;
import com.trucity.company.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobsService {

    private final JobsRepository jobsRepository;

    private final CompanyRepository companyRepository;

    private final ApplicationRepository applicationRepository;

    private final AuditService auditService;

    private final JobSkillRepository jobSkillRepository;


    /*
    |--------------------------------------------------------------------------
    | ADMIN — ALL JOBS
    |--------------------------------------------------------------------------
    */

    @Transactional(readOnly = true)
    public List<JobsResponse> getAllJobs() {

        return jobsRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    /*
    |--------------------------------------------------------------------------
    | EMPLOYER — COMPANY JOBS
    |--------------------------------------------------------------------------
    */

    @Transactional(readOnly = true)
    public List<JobsResponse> getCompanyJobs(
            Authentication authentication
    ) {

        String email =
                getAuthenticatedEmail(
                        authentication
                );

        return jobsRepository
                .findAllForEmployer(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
    |--------------------------------------------------------------------------
    | CANDIDATE — OPEN JOBS
    |--------------------------------------------------------------------------
    */

       @Transactional(readOnly = true)
       public List<JobsResponse> getOpenJobs() {

        return jobsRepository
                .findByStatusIgnoreCaseOrderByCreatedAtDesc("ACTIVE")
                .stream()
                .map(this::toResponse)
               .toList();
        }


    /*
    |--------------------------------------------------------------------------
    | EMPLOYER — SINGLE JOB
    |--------------------------------------------------------------------------
    */

    @Transactional(readOnly = true)
    public JobsResponse getCompanyJob(
            UUID jobId,
            Authentication authentication
    ) {

        if (jobId == null) {
            throw new IllegalArgumentException(
                    "Job ID cannot be null."
            );
        }

        String email =
                getAuthenticatedEmail(
                        authentication
                );

        Jobs job =
                jobsRepository.findEmployerJob(
                        jobId,
                        email
                );

        if (job == null) {
            throw new IllegalArgumentException(
                    "Job not found or you are not authorized to view it."
            );
        }

        return toResponse(job);
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    @Transactional
    public JobsResponse createCompanyJob(
            CreateCompanyJobRequest request,
            Authentication authentication
    ) {

        validateCreateRequest(request);

        String email =
                getAuthenticatedEmail(
                        authentication
                );

        UUID companyId =
                jobsRepository
                        .findCompanyIdByEmployerEmail(
                                email
                        );

        if (companyId == null) {
            throw new IllegalArgumentException(
                    "No company is associated with employer: "
                            + email
            );
        }

        companyRepository
                .findById(companyId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Company not found: "
                                        + companyId
                        )
                );

        Jobs job =
                new Jobs();

        job.setCompanyId(companyId);

        job.setTitle(
                clean(request.title())
        );

        job.setDepartment(
                clean(request.department())
        );

        job.setDescription(
                cleanOrEmpty(
                        request.description()
                )
        );

        job.setLocation(
                clean(request.location())
        );

        job.setWorkplaceType(
                clean(request.workplaceType())
        );

        job.setEmploymentType(
                clean(request.employmentType())
        );

        job.setSalaryMin(
                request.salaryMin()
        );

        job.setSalaryMax(
                request.salaryMax()
        );

        job.setSalaryCurrency(
                request.salaryCurrency() == null
                        || request.salaryCurrency().isBlank()
                        ? "ZAR"
                        : request.salaryCurrency()
                            .trim()
                            .toUpperCase()
        );

        job.setSalaryNegotiable(
                Boolean.TRUE.equals(
                        request.salaryNegotiable()
                )
        );

        job.setQualifications(
                cleanOrEmpty(
                        request.qualifications()
                )
        );

        job.setExperienceRequired(
                cleanOrEmpty(
                        request.experienceRequired()
                )
        );

        job.setResponsibilities(
                cleanOrEmpty(
                        request.responsibilities()
                )
        );

        job.setBenefits(
                cleanOrEmpty(
                        request.benefits()
                )
        );

        job.setOpenings(
                request.openings() == null
                        ? 1
                        : request.openings()
        );

        job.setApplicationDeadline(
                request.applicationDeadline()
        );

        job.setStatus("ACTIVE");

        job.setCreatedAt(
                LocalDateTime.now()
        );

        Jobs savedJob =
                jobsRepository.save(job);

        jobSkillRepository.replaceSkills(
                savedJob.getId(),
                request.skills()
        );

        auditService.logSystem(
                "JOB_CREATED",
                "Job '"
                        + savedJob.getTitle()
                        + "' created for company "
                        + companyId
                        + " by "
                        + email
        );

        return toResponse(savedJob);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    @Transactional
    public JobsResponse updateCompanyJob(
            UUID jobId,
            UpdateCompanyJobRequest request,
            Authentication authentication
    ) {

        if (jobId == null) {
            throw new IllegalArgumentException(
                    "Job ID cannot be null."
            );
        }

        validateUpdateRequest(request);

        String email =
                getAuthenticatedEmail(
                        authentication
                );

        Jobs job =
                jobsRepository.findEmployerJob(
                        jobId,
                        email
                );

        if (job == null) {
            throw new IllegalArgumentException(
                    "Job not found or you are not authorized to edit it."
            );
        }

        job.setTitle(
                clean(request.title())
        );

        job.setDepartment(
                clean(request.department())
        );

        job.setDescription(
                cleanOrEmpty(
                        request.description()
                )
        );

        job.setLocation(
                clean(request.location())
        );

        job.setWorkplaceType(
                clean(request.workplaceType())
        );

        job.setEmploymentType(
                clean(request.employmentType())
        );

        job.setSalaryMin(
                request.salaryMin()
        );

        job.setSalaryMax(
                request.salaryMax()
        );

        job.setSalaryCurrency(
                request.salaryCurrency() == null
                        || request.salaryCurrency().isBlank()
                        ? "ZAR"
                        : request.salaryCurrency()
                            .trim()
                            .toUpperCase()
        );

        job.setSalaryNegotiable(
                Boolean.TRUE.equals(
                        request.salaryNegotiable()
                )
        );

        job.setQualifications(
                cleanOrEmpty(
                        request.qualifications()
                )
        );

        job.setExperienceRequired(
                cleanOrEmpty(
                        request.experienceRequired()
                )
        );

        job.setResponsibilities(
                cleanOrEmpty(
                        request.responsibilities()
                )
        );

        job.setBenefits(
                cleanOrEmpty(
                        request.benefits()
                )
        );

        job.setOpenings(
                request.openings() == null
                        ? 1
                        : request.openings()
        );

        job.setApplicationDeadline(
                request.applicationDeadline()
        );

        Jobs savedJob =
                jobsRepository.save(job);

        jobSkillRepository.replaceSkills(
                savedJob.getId(),
                request.skills()
        );

        auditService.logSystem(
                "JOB_UPDATED",
                "Job '"
                        + savedJob.getTitle()
                        + "' updated by "
                        + email
        );

        return toResponse(savedJob);
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    |
    | A job with applications is NOT physically deleted.
    |
    */

    @Transactional
    public void deleteCompanyJob(
            UUID jobId,
            Authentication authentication
    ) {

        if (jobId == null) {
            throw new IllegalArgumentException(
                    "Job ID cannot be null."
            );
        }

        String email =
                getAuthenticatedEmail(
                        authentication
                );

        Jobs job =
                jobsRepository.findEmployerJob(
                        jobId,
                        email
                );

        if (job == null) {
            throw new IllegalArgumentException(
                    "Job not found or you are not authorized to delete it."
            );
        }

        long applicationCount =
                applicationRepository
                        .countByJobId(jobId);

        if (applicationCount > 0) {
            throw new IllegalStateException(
                    "This job has "
                            + applicationCount
                            + " application"
                            + (applicationCount == 1
                            ? ""
                            : "s")
                            + " and cannot be permanently deleted. "
                            + "Close the job instead."
            );
        }

        int deleted =
                jobsRepository.deleteEmployerJob(
                        jobId,
                        email
                );

        if (deleted == 0) {
            throw new IllegalArgumentException(
                    "Job could not be deleted."
            );
        }

        auditService.logSystem(
                "JOB_DELETED",
                "Job '"
                        + job.getTitle()
                        + "' permanently deleted by "
                        + email
        );
    }


    /*
    |--------------------------------------------------------------------------
    | EMPLOYER — CLOSE JOB
    |--------------------------------------------------------------------------
    */

    @Transactional
    public JobsResponse closeCompanyJob(
            UUID jobId,
            Authentication authentication
    ) {

        if (jobId == null) {
            throw new IllegalArgumentException(
                    "Job ID cannot be null."
            );
        }

        String email =
                getAuthenticatedEmail(
                        authentication
                );

        Jobs job =
                jobsRepository.findEmployerJob(
                        jobId,
                        email
                );

        if (job == null) {
            throw new IllegalArgumentException(
                    "Job not found or you are not authorized to close it."
            );
        }

        if (!"CLOSED".equalsIgnoreCase(
                job.getStatus()
        )) {

            job.setStatus("CLOSED");

            job =
                    jobsRepository.save(job);

            auditService.logSystem(
                    "JOB_CLOSED",
                    "Job '"
                            + job.getTitle()
                            + "' closed by "
                            + email
            );
        }

        return toResponse(job);
    }


    /*
    |--------------------------------------------------------------------------
    | ADMIN — STATUS
    |--------------------------------------------------------------------------
    */

    @Transactional
    public JobsResponse updateJobStatus(
            UUID id,
            String status,
            Authentication authentication
    ) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Job ID cannot be null."
            );
        }

        if (status == null
                || status.isBlank()) {

            throw new IllegalArgumentException(
                    "Job status cannot be empty."
            );
        }

        String normalizedStatus =
                status.trim().toUpperCase();

        if (!isValidStatus(
                normalizedStatus
        )) {

            throw new IllegalArgumentException(
                    "Invalid job status: "
                            + normalizedStatus
            );
        }

        Jobs job =
                jobsRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Job not found: "
                                                + id
                                )
                        );

        job.setStatus(
                normalizedStatus
        );

        Jobs savedJob =
                jobsRepository.save(job);

        String adminEmail =
                authentication != null
                        ? authentication.getName()
                        : "Administrator";

        auditService.logSystem(
                "JOB_STATUS_UPDATED",
                "Job '"
                        + savedJob.getTitle()
                        + "' status changed to "
                        + normalizedStatus
                        + " by "
                        + adminEmail
        );

        return toResponse(savedJob);
    }


    /*
    |--------------------------------------------------------------------------
    | RESPONSE MAPPING
    |--------------------------------------------------------------------------
    */

    private JobsResponse toResponse(
            Jobs job
    ) {

        String companyName =
                "Unknown Company";

        if (job.getCompanyId() != null) {

            companyName =
                    companyRepository
                            .findById(
                                    job.getCompanyId()
                            )
                            .map(
                                    Company::getName
                            )
                            .orElse(
                                    "Unknown Company"
                            );
        }

        long applicationCount =
                applicationRepository
                        .countByJobId(
                                job.getId()
                        );

        List<String> skills =
                job.getId() == null
                        ? Collections.emptyList()
                        : jobSkillRepository
                            .findSkillNamesByJobId(
                                    job.getId()
                            );

        return new JobsResponse(

                job.getId(),

                job.getCompanyId(),

                companyName,

                job.getTitle(),

                job.getDepartment(),

                job.getDescription(),

                job.getLocation(),

                job.getWorkplaceType(),

                job.getEmploymentType(),

                job.getSalaryMin(),

                job.getSalaryMax(),

                job.getSalaryCurrency(),

                job.getSalaryNegotiable(),

                job.getQualifications(),

                job.getExperienceRequired(),

                skills,

                job.getResponsibilities(),

                job.getBenefits(),

                job.getOpenings(),

                job.getApplicationDeadline(),

                job.getStatus(),

                job.getCreatedAt(),

                applicationCount
        );
    }


    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    private void validateCreateRequest(
            CreateCompanyJobRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Job request cannot be null."
            );
        }

        validateCommonFields(
                request.title(),
                request.department(),
                request.location(),
                request.workplaceType(),
                request.employmentType(),
                request.salaryMin(),
                request.salaryMax(),
                request.openings()
        );
    }

    private void validateUpdateRequest(
            UpdateCompanyJobRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Job request cannot be null."
            );
        }

        validateCommonFields(
                request.title(),
                request.department(),
                request.location(),
                request.workplaceType(),
                request.employmentType(),
                request.salaryMin(),
                request.salaryMax(),
                request.openings()
        );
    }

    private void validateCommonFields(
            String title,
            String department,
            String location,
            String workplaceType,
            String employmentType,
            BigDecimal salaryMin,
            BigDecimal salaryMax,
            Integer openings
    ) {

        if (title == null
                || title.isBlank()) {

            throw new IllegalArgumentException(
                    "Job title cannot be empty."
            );
        }

        if (department == null
                || department.isBlank()) {

            throw new IllegalArgumentException(
                    "Department cannot be empty."
            );
        }

        if (location == null
                || location.isBlank()) {

            throw new IllegalArgumentException(
                    "Job location cannot be empty."
            );
        }

        if (workplaceType == null
                || workplaceType.isBlank()) {

            throw new IllegalArgumentException(
                    "Workplace type cannot be empty."
            );
        }

        if (employmentType == null
                || employmentType.isBlank()) {

            throw new IllegalArgumentException(
                    "Employment type cannot be empty."
            );
        }

        if (salaryMin != null
                && salaryMin.compareTo(
                        BigDecimal.ZERO
                ) < 0) {

            throw new IllegalArgumentException(
                    "Minimum salary cannot be negative."
            );
        }

        if (salaryMax != null
                && salaryMax.compareTo(
                        BigDecimal.ZERO
                ) < 0) {

            throw new IllegalArgumentException(
                    "Maximum salary cannot be negative."
            );
        }

        if (salaryMin != null
                && salaryMax != null
                && salaryMin.compareTo(
                        salaryMax
                ) > 0) {

            throw new IllegalArgumentException(
                    "Minimum salary cannot be greater than maximum salary."
            );
        }

        if (openings != null
                && openings < 1) {

            throw new IllegalArgumentException(
                    "Number of openings must be at least 1."
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    private String clean(
            String value
    ) {

        return value == null
                ? null
                : value.trim();
    }

    private String cleanOrEmpty(
            String value
    ) {

        return value == null
                ? ""
                : value.trim();
    }

    private String getAuthenticatedEmail(
            Authentication authentication
    ) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            throw new IllegalStateException(
                    "Authenticated employer could not be identified."
            );
        }

        return authentication
                .getName()
                .trim();
    }

    private boolean isValidStatus(
            String status
    ) {

        return status.equals("ACTIVE")
                || status.equals("PENDING")
                || status.equals("CLOSED")
                || status.equals("SUSPENDED");
    }


}