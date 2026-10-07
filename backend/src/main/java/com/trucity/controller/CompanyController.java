package com.trucity.controller;

import com.trucity.company.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    /*
     * ============================================================
     * ADMIN — LIST COMPANIES
     * ============================================================
     */

    @GetMapping("/admin/companies")
    @PreAuthorize("hasRole('ADMIN')")
    public List<CompanyService.CompanyResponse> companies() {

        return companyService.getCompanies();
    }

    /*
     * ============================================================
     * EMPLOYER — GET COMPANY PROFILE
     * ============================================================
     */

    @GetMapping("/api/company/profile")
    @PreAuthorize("hasRole('EMPLOYER')")
    public CompanyService.CompanyProfileResponse getProfile() {

        return companyService.getCurrentCompany();
    }

    /*
     * ============================================================
     * EMPLOYER — CREATE / UPDATE COMPANY PROFILE
     * ============================================================
     */

    @PutMapping("/api/company/profile")
    @PreAuthorize("hasRole('EMPLOYER')")
    public CompanyService.CompanyProfileResponse saveProfile(
            @RequestBody CompanyService.CompanyProfileRequest request
    ) {

        return companyService.saveCurrentCompany(request);
    }
}
