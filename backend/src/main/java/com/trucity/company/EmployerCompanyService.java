package com.trucity.company;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployerCompanyService {

    private final CompanyRepository companyRepository;

    public CompanyProfileResponse getMyCompanyProfile(String employerEmail) {

        Company company =
                companyRepository.findCompanyByEmployerEmail(employerEmail);

        if (company == null) {
            throw new IllegalStateException(
                    "No company profile found for employer: " + employerEmail
            );
        }

        return new CompanyProfileResponse(
                company.getId().toString(),
                company.getName(),
                company.getName(),
                company.getRegistrationNumber(),
                company.getWebsite(),
                company.getIndustry(),
                null,
                null,
                null,
                null,
                null,
                null,
                "pending",
                company.getCreatedAt(),
                company.getCreatedAt()
        );
    }

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
            String verificationStatus,
            java.time.LocalDateTime createdAt,
            java.time.LocalDateTime updatedAt
    ) {
    }
}
