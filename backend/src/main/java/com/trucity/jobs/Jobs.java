package com.trucity.jobs;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "jobs")
@Getter
@Setter
public class Jobs {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "title")
    private String title;

    @Column(name = "department")
    private String department;

    @Column(
            name = "description",
            columnDefinition = "TEXT"
    )
    private String description;

    @Column(name = "location")
    private String location;

    @Column(name = "workplace_type")
    private String workplaceType;

    @Column(name = "employment_type")
    private String employmentType;

    @Column(name = "salary_min")
    private BigDecimal salaryMin;

    @Column(name = "salary_max")
    private BigDecimal salaryMax;

    @Column(name = "salary_currency")
    private String salaryCurrency;

    @Column(name = "salary_negotiable")
    private Boolean salaryNegotiable;

    @Column(
            name = "qualifications",
            columnDefinition = "TEXT"
    )
    private String qualifications;

    @Column(
            name = "experience_required",
            columnDefinition = "TEXT"
    )
    private String experienceRequired;

    @Column(
            name = "responsibilities",
            columnDefinition = "TEXT"
    )
    private String responsibilities;

    @Column(
            name = "benefits",
            columnDefinition = "TEXT"
    )
    private String benefits;

    @Column(name = "openings")
    private Integer openings;

    @Column(name = "application_deadline")
    private LocalDate applicationDeadline;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}