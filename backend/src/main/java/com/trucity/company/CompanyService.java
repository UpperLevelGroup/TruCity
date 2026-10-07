package com.trucity.company;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final CompanyBillingProfileRepository companyBillingProfileRepository;

    /*
     * ============================================================
     * ADMIN — LIST COMPANIES
     * ============================================================
     */

    @Transactional(readOnly = true)
    public List<CompanyResponse> getCompanies() {

        return companyRepository.findAll()
                .stream()
                .map(company -> new CompanyResponse(
                        company.getId().toString(),
                        company.getName(),
                        company.getRegistrationNumber(),
                        company.getIndustry(),
                        company.getWebsite(),
                        company.getCreatedAt()
                ))
                .toList();
    }

    /*
     * ============================================================
     * AUTHENTICATED EMPLOYER — GET COMPANY
     * ============================================================
     */

    @Transactional(readOnly = true)
    public CompanyProfileResponse getCurrentCompany() {

        String email = getAuthenticatedEmail();

        EmployerProfile employerProfile =
                employerProfileRepository
                        .findByEmployerEmail(email)
                        .orElse(null);

        if (employerProfile == null) {
            return null;
        }

        if (employerProfile.getCompanyId() == null) {
            return null;
        }

        Company company =
                companyRepository
                        .findById(employerProfile.getCompanyId())
                        .orElse(null);

        if (company == null) {
            return null;
        }

        CompanyBillingProfile billing =
                companyBillingProfileRepository
                        .findByCompanyId(company.getId())
                        .orElse(null);

        return toProfileResponse(
                company,
                billing
        );
    }

    /*
     * ============================================================
     * AUTHENTICATED EMPLOYER — CREATE / UPDATE COMPANY
     * ============================================================
     *
     * CIPC VERIFICATION IS INTENTIONALLY NOT PERFORMED.
     *
     * New companies are saved as NOT_VERIFIED.
     * An administrator/verifier can verify the company later.
     */

    public CompanyProfileResponse saveCurrentCompany(
            CompanyProfileRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Company profile is required."
            );
        }

        String email = getAuthenticatedEmail();

        EmployerProfile employerProfile =
                employerProfileRepository
                        .findByEmployerEmail(email)
                        .orElse(null);

        Company company;

        /*
         * ========================================================
         * EXISTING EMPLOYER
         * ========================================================
         */

        if (employerProfile != null) {

            if (employerProfile.getCompanyId() == null) {

                company = newCompany(request);

            } else {

                company =
                        companyRepository
                                .findById(
                                        employerProfile.getCompanyId()
                                )
                                .orElseThrow(() ->
                                        new IllegalArgumentException(
                                                "The employer's company could not be found."
                                        )
                                );
            }

        } else {

            /*
             * ====================================================
             * FIRST COMPANY ONBOARDING
             * ====================================================
             */

            company = newCompany(request);
        }

        /*
         * ========================================================
         * COMPANY IDENTITY
         * ========================================================
         */

        company.setName(
                required(
                        request.legalName(),
                        "Legal company name"
                )
        );

        company.setTradingName(
                clean(request.tradingName())
        );

        company.setRegistrationNumber(
                clean(request.companyRegNo())
        );

        company.setIndustry(
                clean(request.industry())
        );

        company.setRegion(
                clean(request.region())
        );

        company.setRegisteredAddress(
                clean(request.registeredAddress())
        );

        company.setWebsite(
                clean(request.website())
        );

        company.setCompanyEmail(
                clean(request.companyEmail())
        );

        company.setPhone(
                clean(request.phone())
        );

        company.setDescription(
                clean(request.companyDescription())
        );

        /*
         * ========================================================
         * COMPANY REPRESENTATIVE
         * ========================================================
         */

        company.setRepresentativeName(
                clean(request.representativeName())
        );

        company.setRepresentativeEmail(
                clean(request.representativeEmail())
        );

        company.setRepresentativePhone(
                clean(request.representativePhone())
        );

        company.setRepresentativeRole(
                clean(request.representativeRole())
        );

        /*
         * ========================================================
         * VERIFICATION
         * ========================================================
         *
         * CIPC IS NOT CALLED.
         *
         * The frontend cannot approve its own company.
         */

        if (
                company.getVerificationStatus() == null ||
                company.getVerificationStatus().isBlank()
        ) {
            company.setVerificationStatus(
                    "NOT_VERIFIED"
            );
        }

        /*
         * ========================================================
         * SAVE COMPANY
         * ========================================================
         */

        Company savedCompany =
                companyRepository.save(company);

        /*
         * ========================================================
         * EMPLOYER → COMPANY RELATIONSHIP
         * ========================================================
         */

        if (employerProfile == null) {

            UUID userId =
                    employerProfileRepository
                            .findUserIdByEmail(email)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "The authenticated TruCity user could not be found."
                                    )
                            );

            employerProfile =
                    EmployerProfile.builder()
                            .userId(userId)
                            .companyId(
                                    savedCompany.getId()
                            )
                            .build();

        } else {

            employerProfile.setCompanyId(
                    savedCompany.getId()
            );
        }

        employerProfileRepository.save(
                employerProfile
        );

        /*
         * ========================================================
         * BILLING PROFILE
         * ========================================================
         */

        CompanyBillingProfile billing =
                companyBillingProfileRepository
                        .findByCompanyId(
                                savedCompany.getId()
                        )
                        .orElseGet(() ->
                                CompanyBillingProfile.builder()
                                        .companyId(
                                                savedCompany.getId()
                                        )
                                        .build()
                        );

        billing.setBillingContactName(
                clean(request.billingContactName())
        );

        billing.setBillingContactEmail(
                clean(request.billingContactEmail())
        );

        billing.setInvoicingAddress(
                clean(request.invoicingAddress())
        );

        boolean agreed =
                Boolean.TRUE.equals(
                        request.agreeToTerms()
                );

        billing.setAgreeToTerms(
                agreed
        );

        if (
                agreed &&
                billing.getTermsAgreedAt() == null
        ) {
            billing.setTermsAgreedAt(
                    LocalDateTime.now()
            );
        }

        companyBillingProfileRepository.save(
                billing
        );

        /*
         * ========================================================
         * RESPONSE
         * ========================================================
         */

        return toProfileResponse(
                savedCompany,
                billing
        );
    }

    /*
     * ============================================================
     * CREATE NEW COMPANY
     * ============================================================
     */

    private Company newCompany(
            CompanyProfileRequest request
    ) {

        return Company.builder()
                .name(
                        required(
                                request.legalName(),
                                "Legal company name"
                        )
                )
                .registrationNumber(
                        clean(request.companyRegNo())
                )
                .industry(
                        clean(request.industry())
                )
                .website(
                        clean(request.website())
                )
                .verificationStatus(
                        "NOT_VERIFIED"
                )
                .build();
    }

    /*
     * ============================================================
     * AUTHENTICATED USER
     * ============================================================
     */

    private String getAuthenticatedEmail() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (
                authentication == null ||
                !authentication.isAuthenticated()
        ) {
            throw new IllegalStateException(
                    "No authenticated user was found."
            );
        }

        String email =
                authentication.getName();

        if (
                email == null ||
                email.isBlank()
        ) {
            throw new IllegalStateException(
                    "The authenticated user's email could not be determined."
            );
        }

        return email.trim();
    }

    /*
     * ============================================================
     * REQUIRED VALIDATION
     * ============================================================
     */

    private String required(
            String value,
            String field
    ) {

        if (
                value == null ||
                value.isBlank()
        ) {
            throw new IllegalArgumentException(
                    field + " is required."
            );
        }

        return value.trim();
    }

    /*
     * ============================================================
     * OPTIONAL FIELD CLEANING
     * ============================================================
     */

    private String clean(String value) {

        if (
                value == null ||
                value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }

    /*
     * ============================================================
     * RESPONSE MAPPING
     * ============================================================
     */

    private CompanyProfileResponse toProfileResponse(
            Company company,
            CompanyBillingProfile billing
    ) {

        return new CompanyProfileResponse(
                company.getId().toString(),
                company.getName(),
                company.getTradingName(),
                company.getRegistrationNumber(),
                company.getWebsite(),
                company.getIndustry(),
                company.getRegion(),
                company.getRegisteredAddress(),
                company.getCompanyEmail(),
                company.getPhone(),
                company.getDescription(),
                company.getRepresentativeName(),
                company.getRepresentativeEmail(),
                company.getRepresentativePhone(),
                company.getRepresentativeRole(),
                company.getVerificationStatus(),
                company.getCreatedAt(),
                company.getUpdatedAt(),
                billing != null
                        ? billing.getBillingContactName()
                        : null,
                billing != null
                        ? billing.getBillingContactEmail()
                        : null,
                billing != null
                        ? billing.getInvoicingAddress()
                        : null,
                billing != null &&
                        billing.isAgreeToTerms()
        );
    }

    /*
     * ============================================================
     * ADMIN RESPONSE
     * ============================================================
     */

    public record CompanyResponse(
            String id,
            String name,
            String registrationNumber,
            String industry,
            String website,
            LocalDateTime createdAt
    ) {}

    /*
     * ============================================================
     * FRONTEND COMPANY PROFILE REQUEST
     * ============================================================
     */

    public record CompanyProfileRequest(
            String legalName,
            String tradingName,
            String companyRegNo,
            String website,
            String industry,
            String region,
            String registeredAddress,
            String companyEmail,
            String phone,
            String companyDescription,
            String representativeName,
            String representativeEmail,
            String representativePhone,
            String representativeRole,
            String verificationStatus,
            String billingContactName,
            String billingContactEmail,
            String invoicingAddress,
            Boolean agreeToTerms
    ) {}

    /*
     * ============================================================
     * FRONTEND COMPANY PROFILE RESPONSE
     * ============================================================
     */

    public record CompanyProfileResponse(
            String id,
            String legalName,
            String tradingName,
            String companyRegNo,
            String website,
            String industry,
            String region,
            String registeredAddress,
            String companyEmail,
            String phone,
            String companyDescription,
            String representativeName,
            String representativeEmail,
            String representativePhone,
            String representativeRole,
            String verificationStatus,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            String billingContactName,
            String billingContactEmail,
            String invoicingAddress,
            boolean agreeToTerms
    ) {}
}
