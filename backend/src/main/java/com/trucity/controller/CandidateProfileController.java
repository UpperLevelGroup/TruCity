package com.trucity.candidate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Candidate's own profile.
 *
 * The authenticated candidate is resolved from the JWT email.
 * No candidate id is accepted from the browser for ownership.
 */
@RestController
@RequestMapping("/api/candidate/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CANDIDATE')")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateProfileController {

    @PersistenceContext
    private EntityManager entityManager;

    private final ObjectMapper objectMapper;

    @GetMapping
    @Transactional
    public CandidateProfileResponse getProfile(
            Authentication authentication
    ) {
        UUID candidateId = findCandidateId(authentication);
        Object[] row = findProfileRow(candidateId);

        return new CandidateProfileResponse(
                toUuid(row[0]),
                toUuid(row[1]),
                toString(row[2]),
                toString(row[3]),
                toString(row[4]),
                toString(row[5]),
                toString(row[6]),
                toString(row[7]),
                toString(row[8]),
                toInteger(row[9]),
                readJson(
                        getMediaColumn(candidateId, "skills"),
                        new TypeReference<List<String>>() {}
                )
        );
    }

    @PutMapping
    @Transactional
    public CandidateProfileResponse updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        UUID candidateId = findCandidateId(authentication);

        if (request == null) {
            throw new IllegalArgumentException(
                    "Profile update data is required."
            );
        }

        entityManager.createNativeQuery("""
                UPDATE candidate_profiles
                SET
                    headline = :headline,
                    bio = :bio,
                    location = :location
                WHERE id = :candidateId
                """)
                .setParameter("headline", clean(request.headline()))
                .setParameter("bio", clean(request.bio()))
                .setParameter("location", clean(request.location()))
                .setParameter("candidateId", candidateId)
                .executeUpdate();

        if (request.phone() != null) {
            entityManager.createNativeQuery("""
                    UPDATE users
                    SET phone = :phone
                    WHERE id = (
                        SELECT user_id
                        FROM candidate_profiles
                        WHERE id = :candidateId
                    )
                    """)
                    .setParameter("phone", clean(request.phone()))
                    .setParameter("candidateId", candidateId)
                    .executeUpdate();
        }

        saveMediaColumn(
                candidateId,
                "skills",
                writeJson(
                        request.skills() == null
                                ? List.of()
                                : request.skills()
                )
        );

        return getProfile(authentication);
    }

    @GetMapping("/media")
    @Transactional
    public ProfileMediaResponse getMedia(
            Authentication authentication
    ) {
        UUID candidateId = findCandidateId(authentication);

        return new ProfileMediaResponse(
                getMediaColumn(candidateId, "face_photo"),
                readJson(
                        getMediaColumn(candidateId, "gallery_images"),
                        new TypeReference<List<GalleryImage>>() {}
                ),
                readJson(
                        getMediaColumn(candidateId, "documents"),
                        new TypeReference<List<DocumentItem>>() {}
                ),
                readJson(
                        getMediaColumn(candidateId, "projects"),
                        new TypeReference<List<ProjectItem>>() {}
                ),
                readJson(
                        getMediaColumn(candidateId, "reel_meta"),
                        new TypeReference<IntroReelMeta>() {}
                ),
                readJson(
                        getMediaColumn(candidateId, "preferences"),
                        new TypeReference<Preferences>() {}
                )
        );
    }

    @PutMapping("/media")
    @Transactional
    @ResponseStatus(HttpStatus.OK)
    public ProfileMediaResponse updateMedia(
            @RequestBody ProfileMediaPatch patch,
            Authentication authentication
    ) {
        UUID candidateId = findCandidateId(authentication);

        if (patch == null) {
            throw new IllegalArgumentException(
                    "Profile media data is required."
            );
        }

        if (patch.facePhoto() != null) {
            saveMediaColumn(
                    candidateId,
                    "face_photo",
                    patch.facePhoto()
            );
        }

        if (patch.galleryImages() != null) {
            saveMediaColumn(
                    candidateId,
                    "gallery_images",
                    writeJson(patch.galleryImages())
            );
        }

        if (patch.documents() != null) {
            saveMediaColumn(
                    candidateId,
                    "documents",
                    writeJson(patch.documents())
            );
        }

        if (patch.projects() != null) {
            saveMediaColumn(
                    candidateId,
                    "projects",
                    writeJson(patch.projects())
            );
        }

        if (patch.reelMeta() != null) {
            saveMediaColumn(
                    candidateId,
                    "reel_meta",
                    writeJson(patch.reelMeta())
            );
        }

        if (patch.preferences() != null) {
            saveMediaColumn(
                    candidateId,
                    "preferences",
                    writeJson(patch.preferences())
            );
        }

        return getMedia(authentication);
    }

    private UUID findCandidateId(
            Authentication authentication
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()) {
            throw new IllegalStateException(
                    "Authenticated candidate could not be identified."
            );
        }

        List<?> rows = entityManager.createNativeQuery("""
                SELECT cp.id
                FROM candidate_profiles cp
                JOIN users u
                    ON u.id = cp.user_id
                WHERE LOWER(u.email) = LOWER(:email)
                LIMIT 1
                """)
                .setParameter(
                        "email",
                        authentication.getName().trim()
                )
                .getResultList();

        if (rows.isEmpty()) {
            throw new IllegalArgumentException(
                    "Candidate profile was not found."
            );
        }

        return toUuid(rows.get(0));
    }

    private Object[] findProfileRow(
            UUID candidateId
    ) {
        List<?> rows = entityManager.createNativeQuery("""
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
                    cp.years_experience
                FROM candidate_profiles cp
                JOIN users u
                    ON u.id = cp.user_id
                WHERE cp.id = :candidateId
                LIMIT 1
                """)
                .setParameter(
                        "candidateId",
                        candidateId
                )
                .getResultList();

        if (rows.isEmpty()) {
            throw new IllegalArgumentException(
                    "Candidate profile was not found."
            );
        }

        return (Object[]) rows.get(0);
    }

    private String getMediaColumn(
            UUID candidateId,
            String column
    ) {
        List<?> rows = entityManager.createNativeQuery(
                "SELECT " + column
                        + " FROM candidate_profile_details "
                        + "WHERE candidate_id = :candidateId"
        )
                .setParameter("candidateId", candidateId)
                .getResultList();

        if (rows.isEmpty() || rows.get(0) == null) {
            return null;
        }

        return rows.get(0).toString();
    }

    private void saveMediaColumn(
            UUID candidateId,
            String column,
            String value
    ) {
        Number count = (Number) entityManager.createNativeQuery("""
                SELECT COUNT(*)
                FROM candidate_profile_details
                WHERE candidate_id = :candidateId
                """)
                .setParameter("candidateId", candidateId)
                .getSingleResult();

        if (count.longValue() == 0) {
            entityManager.createNativeQuery("""
                    INSERT INTO candidate_profile_details (
                        candidate_id,
                        updated_at
                    )
                    VALUES (
                        :candidateId,
                        NOW()
                    )
                    """)
                    .setParameter("candidateId", candidateId)
                    .executeUpdate();
        }

        entityManager.createNativeQuery(
                "UPDATE candidate_profile_details "
                        + "SET " + column + " = :value, "
                        + "updated_at = NOW() "
                        + "WHERE candidate_id = :candidateId"
        )
                .setParameter("value", value)
                .setParameter("candidateId", candidateId)
                .executeUpdate();
    }

    private <T> T readJson(
            String value,
            TypeReference<T> type
    ) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return objectMapper.readValue(value, type);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(
                    "Stored candidate profile data is invalid.",
                    e
            );
        }
    }

    private <T> String writeJson(T value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(
                    "Unable to store candidate profile data.",
                    e
            );
        }
    }

    private static String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private static UUID toUuid(Object value) {
        if (value instanceof UUID uuid) {
            return uuid;
        }

        return value == null
                ? null
                : UUID.fromString(value.toString());
    }

    private static String toString(Object value) {
        return value == null ? null : value.toString();
    }

    private static Integer toInteger(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.intValue();
        }

        return Integer.valueOf(value.toString());
    }

    public record UpdateProfileRequest(
            String headline,
            String phone,
            String location,
            String bio,
            List<String> skills
    ) {
    }

    public record CandidateProfileResponse(
            UUID id,
            UUID userId,
            String firstName,
            String lastName,
            String email,
            String phone,
            String headline,
            String bio,
            String location,
            Integer yearsExperience,
            List<String> skills
    ) {
    }

    public record ProfileMediaPatch(
            String facePhoto,
            List<GalleryImage> galleryImages,
            List<DocumentItem> documents,
            List<ProjectItem> projects,
            IntroReelMeta reelMeta,
            Preferences preferences
    ) {
    }

    @DeleteMapping("/media/reel")
    @Transactional
    public ProfileMediaResponse removeReel(
            Authentication authentication
    ) {
        UUID candidateId = findCandidateId(authentication);

        saveMediaColumn(
                candidateId,
                "reel_meta",
                null
        );

        return getMedia(authentication);
    }

    public record ProfileMediaResponse(
            String facePhoto,
            List<GalleryImage> galleryImages,
            List<DocumentItem> documents,
            List<ProjectItem> projects,
            IntroReelMeta reelMeta,
            Preferences preferences
    ) {
    }

    public record GalleryImage(
            String id,
            String name,
            String category,
            String image,
            String uploadedAt
    ) {
    }

    public record DocumentItem(
            int id,
            String name,
            String status,
            String fileName,
            String fileSize,
            String dataUrl
    ) {
    }

    public record ProjectItem(
            long id,
            String name,
            String tech,
            String status,
            String desc
    ) {
    }

    public record IntroReelMeta(
            String fileName,
            String fileSize,
            String uploadedAt,
            String dataUrl
    ) {
    }

    public record Preferences(
            String availability
    ) {
    }
}
