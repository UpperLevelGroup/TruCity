package com.trucity.company;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CompanyBillingProfileRepository
        extends JpaRepository<CompanyBillingProfile, UUID> {

    Optional<CompanyBillingProfile> findByCompanyId(
            UUID companyId
    );
}
