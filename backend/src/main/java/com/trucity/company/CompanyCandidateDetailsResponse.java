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
        List<ExperienceResponse> experienceHistory,
        ProfileMediaResponse media
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

    public record ProfileMediaResponse(
            String facePhoto,
            String fullBodyPhoto,
            List<GalleryImageResponse> galleryImages,
            List<DocumentResponse> documents,
            List<ProjectResponse> projects,
            IntroReelResponse reelMeta,
            PreferencesResponse preferences
    ) {
    }

    public record GalleryImageResponse(
            String id,
            String name,
            String category,
            String image,
            String uploadedAt
    ) {
    }

    public record DocumentResponse(
            int id,
            String name,
            String status,
            String fileName,
            String fileSize,
            String dataUrl
    ) {
    }

    public record ProjectResponse(
            int id,
            String name,
            String tech,
            String status,
            String desc
    ) {
    }

    public record IntroReelResponse(
            String fileName,
            String fileSize,
            String uploadedAt,
            String dataUrl
    ) {
    }

    public record PreferencesResponse(
            String availability
    ) {
    }
}
