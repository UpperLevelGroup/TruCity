package com.trucity.company;

import java.util.List;
import java.util.UUID;

public record CompanyCandidateDetailsResponse(
        UUID id,
        UUID userId,
        String firstName,
        String lastName,
        String name,
        String email,
        String phone,
        String headline,
        String bio,
        String location,
        int yearsExperience,
        Integer profileCompletion,
        boolean verified,
        List<SkillResponse> skills,
        List<QualificationResponse> qualifications,
        List<ExperienceResponse> experienceHistory
) {

    public record SkillResponse(
            String name,
            String proficiency,
            Integer yearsUsed
    ) {
    }

    public record QualificationResponse(
            UUID id,
            String institution,
            String qualificationName,
            String fieldOfStudy,
            Integer startYear,
            Integer completionYear,
            String verificationStatus
    ) {
    }

    public record ExperienceResponse(
            UUID id,
            String companyName,
            String jobTitle,
            String description,
            String startDate,
            String endDate
    ) {
    }
}
