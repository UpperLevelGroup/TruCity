package com.trucity.company;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyCandidateDetailsService {

    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public CompanyCandidateDetailsResponse getCandidateDetails(
            UUID candidateId,
            String employerEmail
    ) {
        if (candidateId == null) {
            throw new IllegalArgumentException("Candidate id is required.");
        }

        if (employerEmail == null || employerEmail.isBlank()) {
            throw new IllegalArgumentException("Authenticated employer is required.");
        }

        boolean belongsToEmployer = hasApplicationForEmployer(
                candidateId,
                employerEmail
        );

        if (!belongsToEmployer) {
            throw new IllegalArgumentException(
                    "Candidate not found in this company's applications."
            );
        }

        Object[] row = getCandidateRow(candidateId);

        UUID id = toUuid(row[0]);
        UUID userId = toUuid(row[1]);
        String firstName = toStringValue(row[2]);
        String lastName = toStringValue(row[3]);
        String name = buildName(firstName, lastName);
        String email = toStringValue(row[4]);
        String phone = toStringValue(row[5]);
        String headline = toStringValue(row[6]);
        String bio = toStringValue(row[7]);
        String location = toStringValue(row[8]);
        int yearsExperience = toInt(row[9]);
        Integer profileCompletion = toNullableInt(row[10]);
        boolean verified = toBoolean(row[11]);

        return new CompanyCandidateDetailsResponse(
                id,
                userId,
                firstName,
                lastName,
                name,
                email,
                phone,
                headline,
                bio,
                location,
                yearsExperience,
                profileCompletion,
                verified,
                getSkills(candidateId),
                getQualifications(candidateId),
                getExperience(candidateId)
        );
    }

    private boolean hasApplicationForEmployer(
            UUID candidateId,
            String employerEmail
    ) {
        Number result = (Number) entityManager.createNativeQuery("""
                SELECT COUNT(*)
                FROM applications a
                JOIN jobs j
                    ON j.id = a.job_id
                JOIN employer_profiles ep
                    ON ep.company_id = j.company_id
                JOIN users employer_user
                    ON employer_user.id = ep.user_id
                WHERE a.candidate_id = :candidateId
                  AND LOWER(employer_user.email) = LOWER(:email)
                """)
                .setParameter("candidateId", candidateId)
                .setParameter("email", employerEmail)
                .getSingleResult();

        return result != null && result.longValue() > 0;
    }

    private Object[] getCandidateRow(UUID candidateId) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = entityManager.createNativeQuery("""
                SELECT
                    cp.id,
                    cp.user_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone,
                    cp.headline,
                    cp.bio,
                    cp.location,
                    cp.years_experience,
                    cp.profile_completion,
                    u.is_verified
                FROM candidate_profiles cp
                JOIN users u
                    ON u.id = cp.user_id
                WHERE cp.id = :candidateId
                LIMIT 1
                """)
                .setParameter("candidateId", candidateId)
                .getResultList();

        if (rows.isEmpty()) {
            throw new IllegalArgumentException("Candidate not found: " + candidateId);
        }

        return rows.get(0);
    }

    private List<CompanyCandidateDetailsResponse.SkillResponse> getSkills(
            UUID candidateId
    ) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = entityManager.createNativeQuery("""
                SELECT
                    s.name,
                    cs.proficiency,
                    cs.years_used
                FROM candidate_skills cs
                JOIN skills s
                    ON s.id = cs.skill_id
                WHERE cs.candidate_id = :candidateId
                ORDER BY LOWER(s.name)
                """)
                .setParameter("candidateId", candidateId)
                .getResultList();

        List<CompanyCandidateDetailsResponse.SkillResponse> result =
                new ArrayList<>();

        for (Object[] row : rows) {
            result.add(new CompanyCandidateDetailsResponse.SkillResponse(
                    toStringValue(row[0]),
                    toStringValue(row[1]),
                    toNullableInt(row[2])
            ));
        }

        return result;
    }

    private List<CompanyCandidateDetailsResponse.QualificationResponse> getQualifications(
            UUID candidateId
    ) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = entityManager.createNativeQuery("""
                SELECT
                    id,
                    institution,
                    qualification_name,
                    field_of_study,
                    start_year,
                    completion_year,
                    verification_status
                FROM qualifications
                WHERE candidate_id = :candidateId
                ORDER BY completion_year DESC NULLS LAST,
                         qualification_name ASC NULLS LAST
                """)
                .setParameter("candidateId", candidateId)
                .getResultList();

        List<CompanyCandidateDetailsResponse.QualificationResponse> result =
                new ArrayList<>();

        for (Object[] row : rows) {
            result.add(new CompanyCandidateDetailsResponse.QualificationResponse(
                    toUuid(row[0]),
                    toStringValue(row[1]),
                    toStringValue(row[2]),
                    toStringValue(row[3]),
                    toNullableInt(row[4]),
                    toNullableInt(row[5]),
                    toStringValue(row[6])
            ));
        }

        return result;
    }

    private List<CompanyCandidateDetailsResponse.ExperienceResponse> getExperience(
            UUID candidateId
    ) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = entityManager.createNativeQuery("""
                SELECT
                    id,
                    company_name,
                    job_title,
                    description,
                    start_date,
                    end_date
                FROM experience
                WHERE candidate_id = :candidateId
                ORDER BY start_date DESC NULLS LAST,
                         job_title ASC NULLS LAST
                """)
                .setParameter("candidateId", candidateId)
                .getResultList();

        List<CompanyCandidateDetailsResponse.ExperienceResponse> result =
                new ArrayList<>();

        for (Object[] row : rows) {
            result.add(new CompanyCandidateDetailsResponse.ExperienceResponse(
                    toUuid(row[0]),
                    toStringValue(row[1]),
                    toStringValue(row[2]),
                    toStringValue(row[3]),
                    toDateString(row[4]),
                    toDateString(row[5])
            ));
        }

        return result;
    }

    private UUID toUuid(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof UUID uuid) {
            return uuid;
        }

        return UUID.fromString(value.toString());
    }

    private String toStringValue(Object value) {
        return value == null ? null : value.toString();
    }

    private int toInt(Object value) {
        if (value == null) {
            return 0;
        }
        return ((Number) value).intValue();
    }

    private Integer toNullableInt(Object value) {
        if (value == null) {
            return null;
        }
        return ((Number) value).intValue();
    }

    private boolean toBoolean(Object value) {
        if (value == null) {
            return false;
        }
        if (value instanceof Boolean bool) {
            return bool;
        }
        return Boolean.parseBoolean(value.toString());
    }

    private String toDateString(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Date sqlDate) {
            return sqlDate.toLocalDate().toString();
        }
        return value.toString();
    }

    private String buildName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        String combined = (first + " " + last).trim();
        return combined.isBlank() ? "Unnamed Candidate" : combined;
    }
}
