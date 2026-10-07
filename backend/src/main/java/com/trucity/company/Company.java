package com.trucity.company;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /*
     * ============================================================
     * COMPANY IDENTITY
     * ============================================================
     */

    @Column(nullable = false)
    private String name;

    @Column(name = "trading_name")
    private String tradingName;

    @Column(name = "registration_number")
    private String registrationNumber;

    @Column(name = "industry")
    private String industry;

    @Column(name = "region")
    private String region;

    @Column(name = "registered_address")
    private String registeredAddress;

    @Column(name = "location")
    private String location;

    @Column(name = "website")
    private String website;

    @Column(name = "company_email")
    private String companyEmail;

    @Column(name = "phone")
    private String phone;

    @Column(name = "description")
    private String description;

    /*
     * ============================================================
     * COMPANY REPRESENTATIVE
     * ============================================================
     */

    @Column(name = "representative_name")
    private String representativeName;

    @Column(name = "representative_email")
    private String representativeEmail;

    @Column(name = "representative_phone")
    private String representativePhone;

    @Column(name = "representative_role")
    private String representativeRole;

    /*
     * ============================================================
     * VERIFICATION
     * ============================================================
     *
     * CIPC is intentionally NOT called during onboarding.
     *
     * New companies start as:
     *
     * NOT_VERIFIED
     *
     * An administrator/verifier can later change this.
     */

    @Column(
            name = "verification_status",
            nullable = false
    )
    private String verificationStatus;

    @Column(name = "verification_checked_at")
    private LocalDateTime verificationCheckedAt;

    /*
     * Reserved for future CIPC integration.
     *
     * These fields remain empty while CIPC access is unavailable.
     */

    @Column(name = "cipc_enterprise_name")
    private String cipcEnterpriseName;

    @Column(name = "cipc_enterprise_status")
    private String cipcEnterpriseStatus;

    @Column(name = "cipc_registration_date")
    private String cipcRegistrationDate;

    @Column(name = "cipc_physical_address")
    private String cipcPhysicalAddress;

    /*
     * ============================================================
     * TIMESTAMPS
     * ============================================================
     */

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /*
     * ============================================================
     * JPA LIFECYCLE
     * ============================================================
     */

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (verificationStatus == null) {
            verificationStatus =
                    "NOT_VERIFIED";
        }
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }
}