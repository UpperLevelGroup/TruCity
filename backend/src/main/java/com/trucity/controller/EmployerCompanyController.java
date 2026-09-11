package com.trucity.controller;

import com.trucity.company.EmployerCompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('EMPLOYER')")
public class EmployerCompanyController {

    private final EmployerCompanyService employerCompanyService;

    @GetMapping("/profile")
    public EmployerCompanyService.CompanyProfileResponse getMyCompanyProfile(
            Authentication authentication
    ) {
        return employerCompanyService.getMyCompanyProfile(
                authentication.getName()
        );
    }
}