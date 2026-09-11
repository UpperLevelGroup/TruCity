package com.trucity.candidate;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CandidateService {

    @PersistenceContext
    private EntityManager entityManager;

    public List<CandidateResponse> getCandidates(
            Authentication authentication
    ) {

        if (
                authentication == null
                        || !authentication.isAuthenticated()
        ) {
            throw new IllegalStateException(
                    "Employer authentication is required"
            );
        }

        List<?> rawRows =
                entityManager
                        .createNativeQuery("""
                                SELECT
                                    cp.id,
                                    u.id AS user_id,
                                    u.first_name,
                                    u.last_name,
                                    u.email,
                                    cp.headline,
                                    cp.location,
                                    cp.bio,
                                    COALESCE(
                                        cp.years_experience,
                                        0
                                    ),
                                    COALESCE(
                                        u.is_verified,
                                        false
                                    ),

                                    COALESCE(
                                        STRING_AGG(
                                            DISTINCT s.name,
                                            ', '
                                            ORDER BY s.name
                                        ),
                                        ''
                                    ) AS skills

                                FROM candidate_profiles cp

                                INNER JOIN users u
                                    ON u.id = cp.user_id

                                INNER JOIN user_roles ur
                                    ON ur.user_id = u.id

                                INNER JOIN roles r
                                    ON r.id = ur.role_id

                                LEFT JOIN candidate_skills cs
                                    ON cs.candidate_id = cp.id

                                LEFT JOIN skills s
                                    ON s.id = cs.skill_id

                                WHERE r.name = 'CANDIDATE'

                                GROUP BY
                                    cp.id,
                                    u.id,
                                    u.first_name,
                                    u.last_name,
                                    u.email,
                                    cp.headline,
                                    cp.location,
                                    cp.bio,
                                    cp.years_experience,
                                    u.is_verified,
                                    cp.created_at

                                ORDER BY cp.created_at DESC
                                """)
                        .getResultList();

        List<CandidateResponse> candidates =
                new ArrayList<>();

        for (Object result : rawRows) {

            Object[] row =
                    (Object[]) result;

            String firstName =
                    valueOrDefault(
                            row[2],
                            ""
                    );

            String lastName =
                    valueOrDefault(
                            row[3],
                            ""
                    );

            String name =
                    (firstName + " " + lastName)
                            .trim();

            if (name.isBlank()) {
                name = "Unnamed Candidate";
            }

            String headline =
                    valueOrDefault(
                            row[5],
                            "Professional"
                    );

            List<String> skills =
                    parseSkills(row[10]);

            String category =
                    determineCategory(
                            headline,
                            skills
                    );

            int yearsExperience =
                    row[8] != null
                            ? ((Number) row[8])
                                    .intValue()
                            : 0;

            boolean verified =
                    booleanValue(row[9]);

            String status =
                    verified
                            ? "Available"
                            : "In Review";

            candidates.add(
                    new CandidateResponse(
                            value(row[0]),
                            value(row[1]),
                            firstName,
                            lastName,
                            name,
                            valueOrDefault(
                                    row[4],
                                    ""
                            ),
                            headline,
                            category,
                            valueOrDefault(
                                    row[6],
                                    ""
                            ),
                            valueOrDefault(
                                    row[7],
                                    ""
                            ),
                            yearsExperience,
                            verified,
                            skills,
                            status
                    )
            );
        }

        return candidates;
    }

    private String determineCategory(
            String headline,
            List<String> skills
    ) {

        StringBuilder textBuilder =
                new StringBuilder();

        textBuilder.append(
                headline != null
                        ? headline.toLowerCase()
                        : ""
        );

        for (String skill : skills) {
            textBuilder
                    .append(" ")
                    .append(
                            skill.toLowerCase()
                    );
        }

        String text =
                textBuilder.toString();

        if (containsAny(
                text,
                "devops",
                "docker",
                "kubernetes",
                "terraform",
                "aws",
                "azure",
                "gcp",
                "cloud",
                "jenkins",
                "infrastructure",
                "ci/cd"
        )) {
            return "DevOps & Cloud";
        }

        if (containsAny(
                text,
                "machine learning",
                "machine-learning",
                "artificial intelligence",
                "artificial-intelligence",
                "data scientist",
                "data science",
                "data analyst",
                "analytics",
                "power bi",
                "tableau",
                "pandas",
                "numpy"
        )) {
            return "Data & AI";
        }

        if (containsAny(
                text,
                "ui",
                "ux",
                "designer",
                "design",
                "figma",
                "graphic designer",
                "product designer",
                "user experience",
                "user interface"
        )) {
            return "Design";
        }

        if (containsAny(
                text,
                "java",
                "javascript",
                "typescript",
                "react",
                "angular",
                "vue",
                "frontend",
                "front-end",
                "backend",
                "back-end",
                "developer",
                "software",
                "programmer",
                "full stack",
                "full-stack",
                "python",
                "c#",
                ".net",
                "php",
                "sql",
                "spring boot"
        )) {
            return "Software Engineering";
        }

        return "Other";
    }

    private boolean containsAny(
            String text,
            String... values
    ) {

        return Arrays.stream(values)
                .anyMatch(
                        text::contains
                );
    }

    private List<String> parseSkills(
            Object value
    ) {

        if (value == null) {
            return List.of();
        }

        String skills =
                value.toString().trim();

        if (skills.isBlank()) {
            return List.of();
        }

        return Arrays.stream(
                        skills.split(",")
                )
                .map(String::trim)
                .filter(
                        skill ->
                                !skill.isBlank()
                )
                .toList();
    }

    private String value(
            Object value
    ) {

        return value != null
                ? value.toString()
                : null;
    }

    private String valueOrDefault(
            Object value,
            String defaultValue
    ) {

        return value != null
                ? value.toString()
                : defaultValue;
    }

    private boolean booleanValue(
            Object value
    ) {

        if (
                value instanceof Boolean
                        booleanValue
        ) {
            return booleanValue;
        }

        return value != null
                && Boolean.parseBoolean(
                        value.toString()
                );
    }
}