package com.trucity.candidate;

import java.util.List;

public record CandidateResponse(
        String id,
        String userId,
        String firstName,
        String lastName,
        String name,
        String email,
        String headline,
        String category,
        String location,
        String bio,
        int yearsExperience,
        boolean verified,
        List<String> skills,
        String status
) {
}