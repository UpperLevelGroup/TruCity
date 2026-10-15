package com.trucity.company.hub;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyHubContentRepository extends JpaRepository<CompanyHubContent, UUID> {
    List<CompanyHubContent> findAllByCompanyIdOrderByUpdatedAtDesc(UUID companyId);
    Optional<CompanyHubContent> findByIdAndCompanyId(UUID id, UUID companyId);
    List<CompanyHubContent> findAllByStatusOrderByPublishedAtDesc(String status);
}
