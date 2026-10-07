package com.trucity.company;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "company_billing_profiles",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_company_billing_profiles_company_id",
                        columnNames = "company_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyBillingProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "billing_contact_name")
    private String billingContactName;

    @Column(name = "billing_contact_email")
    private String billingContactEmail;

    @Column(name = "invoicing_address")
    private String invoicingAddress;

    @Builder.Default
    @Column(name = "agree_to_terms", nullable = false)
    private boolean agreeToTerms = false;

    @Column(name = "terms_agreed_at")
    private LocalDateTime termsAgreedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (agreeToTerms && termsAgreedAt == null) {
            termsAgreedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();

        if (agreeToTerms && termsAgreedAt == null) {
            termsAgreedAt = LocalDateTime.now();
        }
    }
}