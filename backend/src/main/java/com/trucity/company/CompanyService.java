package com.trucity.company;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository companyRepository;

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

    public record CompanyResponse(
            String id,
            String name,
            String registrationNumber,
            String industry,
            String website,
            java.time.LocalDateTime createdAt
    ) {}
}
