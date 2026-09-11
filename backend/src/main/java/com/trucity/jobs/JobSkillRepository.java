package com.trucity.jobs;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Repository
public class JobSkillRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<String> findSkillNamesByJobId(
            UUID jobId
    ) {
        if (jobId == null) {
            return Collections.emptyList();
        }

        List<?> results =
                entityManager
                        .createNativeQuery(
                                """
                                SELECT s.name
                                FROM job_skills js
                                JOIN skills s
                                    ON s.id = js.skill_id
                                WHERE js.job_id = :jobId
                                ORDER BY LOWER(s.name)
                                """
                        )
                        .setParameter(
                                "jobId",
                                jobId
                        )
                        .getResultList();

        List<String> skills =
                new ArrayList<>();

        for (Object result : results) {
            if (result != null) {
                String value =
                        result.toString().trim();

                if (!value.isBlank()) {
                    skills.add(value);
                }
            }
        }

        return skills;
    }

    @Transactional
    public void replaceSkills(
            UUID jobId,
            List<String> requestedSkills
    ) {
        if (jobId == null) {
            return;
        }

        entityManager
                .createNativeQuery(
                        """
                        DELETE FROM job_skills
                        WHERE job_id = :jobId
                        """
                )
                .setParameter(
                        "jobId",
                        jobId
                )
                .executeUpdate();

        if (requestedSkills == null
                || requestedSkills.isEmpty()) {
            return;
        }

        List<String> normalizedSkills =
                normalizeSkills(
                        requestedSkills
                );

        for (String skillName : normalizedSkills) {

            entityManager
                    .createNativeQuery(
                            """
                            INSERT INTO skills (name)
                            VALUES (:name)
                            ON CONFLICT (name)
                            DO NOTHING
                            """
                    )
                    .setParameter(
                            "name",
                            skillName
                    )
                    .executeUpdate();

            Object result =
                    entityManager
                            .createNativeQuery(
                                    """
                                    SELECT id
                                    FROM skills
                                    WHERE LOWER(name) = LOWER(:name)
                                    LIMIT 1
                                    """
                            )
                            .setParameter(
                                    "name",
                                    skillName
                            )
                            .getResultList()
                            .stream()
                            .findFirst()
                            .orElse(null);

            if (result == null) {
                throw new IllegalStateException(
                        "Unable to create or find skill: "
                                + skillName
                );
            }

            UUID skillId;

            if (result instanceof UUID) {
                skillId = (UUID) result;
            } else {
                skillId =
                        UUID.fromString(
                                result.toString()
                        );
            }

            entityManager
                    .createNativeQuery(
                            """
                            INSERT INTO job_skills (
                                job_id,
                                skill_id,
                                required_level
                            )
                            VALUES (
                                :jobId,
                                :skillId,
                                'REQUIRED'
                            )
                            ON CONFLICT (
                                job_id,
                                skill_id
                            )
                            DO UPDATE SET
                                required_level = 'REQUIRED'
                            """
                    )
                    .setParameter(
                            "jobId",
                            jobId
                    )
                    .setParameter(
                            "skillId",
                            skillId
                    )
                    .executeUpdate();
        }
    }

    private List<String> normalizeSkills(
            List<String> skills
    ) {
        List<String> result =
                new ArrayList<>();

        for (String skill : skills) {

            if (skill == null) {
                continue;
            }

            String normalized =
                    skill.trim();

            if (normalized.isBlank()) {
                continue;
            }

            boolean duplicate =
                    result.stream()
                            .anyMatch(
                                    existing ->
                                            existing.equalsIgnoreCase(
                                                    normalized
                                            )
                            );

            if (!duplicate) {
                result.add(normalized);
            }
        }

        return result;
    }
}
