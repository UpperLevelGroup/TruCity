package com.trucity.jobs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record JobsResponse(

        UUID id,

        UUID companyId,

        String companyName,

        String title,

        String department,

        String description,

        String location,

        String workplaceType,

        String employmentType,

        BigDecimal salaryMin,

        BigDecimal salaryMax,

        String salaryCurrency,

        Boolean salaryNegotiable,

        String qualifications,

        String experienceRequired,

        List<String> skills,

        String responsibilities,

        String benefits,

        Integer openings,

        LocalDate applicationDeadline,

        String status,

        LocalDateTime createdAt,

        long applicationCount
) {
}