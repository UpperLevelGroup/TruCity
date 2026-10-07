package com.trucity.company;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployerProfileService {

    private final EmployerProfileRepository employerProfileRepository;

    /**
     * Gets the employer profile belonging to the authenticated
     * user's email.
     */
    @Transactional(readOnly = true)
    public EmployerProfile getByEmployerEmail(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Employer email is required."
            );
        }

        return employerProfileRepository
                .findByEmployerEmail(email.trim())
                .orElse(null);
    }

    /**
     * Gets an existing employer profile by user ID.
     */
    @Transactional(readOnly = true)
    public EmployerProfile getByUserId(UUID userId) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required."
            );
        }

        return employerProfileRepository
                .findByUserId(userId)
                .orElse(null);
    }

    /**
     * Creates or updates the employer/company relationship.
     */
    public EmployerProfile createProfile(
            UUID userId,
            UUID companyId
    ) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required."
            );
        }

        if (companyId == null) {
            throw new IllegalArgumentException(
                    "Company ID is required."
            );
        }

        EmployerProfile existing =
                employerProfileRepository
                        .findByUserId(userId)
                        .orElse(null);

        if (existing != null) {
            existing.setCompanyId(companyId);

            return employerProfileRepository.save(existing);
        }

        EmployerProfile profile =
                EmployerProfile.builder()
                        .userId(userId)
                        .companyId(companyId)
                        .build();

        return employerProfileRepository.save(profile);
    }

    /**
     * Creates or updates the company association for an employer.
     */
    public EmployerProfile createProfileForEmail(
            String email,
            UUID companyId
    ) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Employer email is required."
            );
        }

        UUID userId =
                employerProfileRepository
                        .findUserIdByEmail(email.trim())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "No TruCity user was found for the authenticated employer."
                                )
                        );

        return createProfile(
                userId,
                companyId
        );
    }
}