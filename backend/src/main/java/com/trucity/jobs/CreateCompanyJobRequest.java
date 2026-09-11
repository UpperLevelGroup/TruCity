package com.trucity.jobs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateCompanyJobRequest(

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

        LocalDate applicationDeadline
) {
}