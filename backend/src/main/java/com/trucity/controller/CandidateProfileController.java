
package com.trucity.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trucity.storage.SupabaseStorageService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Candidate's own profile.
 *
 * The authenticated candidate is resolved from the JWT email.
 * No candidate id is accepted from the browser for ownership.
 *
 * Private document files are stored using durable Supabase storage paths.
 * Signed URLs are temporary and are refreshed when media is retrieved
 * or when a document is opened.
 */
@RestController
@RequestMapping("/api/candidate/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CANDIDATE')")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateProfileController {

    private static final String DOCUMENTS_BUCKET =
            "candidate-profile-documents";

    private static final int SIGNED_URL_EXPIRY_SECONDS = 3600;

    private static final String SIGNED_DOCUMENT_PATH_PREFIX =
            "/storage/v1/object/sign/"
                    + DOCUMENTS_BUCKET
                    + "/";

    @PersistenceContext
    private EntityManager entityManager;

    private final ObjectMapper objectMapper;

    private final SupabaseStorageService supabaseStorageService;

    @Value("${supabase.url}")
    private String supabaseUrl;

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

    @PostMapping(
            value = "/setup/upload/full-body",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Transactional
    @ResponseStatus(HttpStatus.OK)
    public FullBodyPhotoUploadResponse uploadFullBodyPhoto(
            @RequestPart("file") MultipartFile file,
            Authentication authentication
    ) throws IOException {
        UUID candidateId = findCandidateId(authentication);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select a full-body photo to upload."
            );
        }

        if (file.getSize() > 5L * 1024L * 1024L) {
            throw new IllegalArgumentException(
                    "Full-body photos must be 5 MB or smaller."
            );
        }

        String contentType = file.getContentType();

        if (contentType == null
                || !(contentType.equals("image/jpeg")
                || contentType.equals("image/png")
                || contentType.equals("image/webp"))) {
            throw new IllegalArgumentException(
                    "Full-body photo must be a JPEG, PNG or WebP image."
            );
        }

        String photoUrl = supabaseStorageService.uploadProfileImage(
                candidateId,
                "full-body",
                file.getBytes(),
                contentType
        );

        saveMediaColumn(
                candidateId,
                "full_body_photo",
                photoUrl
        );

        return new FullBodyPhotoUploadResponse(photoUrl);
    }

    @GetMapping("/media")
    @Transactional
    public ProfileMediaResponse getMedia(
            Authentication authentication
    ) {
        UUID candidateId = findCandidateId(authentication);

        List<DocumentItem> storedDocuments = readJson(
                getMediaColumn(candidateId, "documents"),
                new TypeReference<List<DocumentItem>>() {}
        );

        /*
         * Refresh document URLs for this response only.
         *
         * Signed URLs are temporary. The durable storagePath is retained
         * so the frontend can request another URL after expiry.
         */
        List<DocumentItem> refreshedDocuments =
                refreshDocumentUrls(candidateId, storedDocuments);

        /*
         * Upgrade legacy document records when their storage path can
         * safely be recovered from a URL belonging to this Supabase
         * project and this authenticated candidate.
         *
         * This does not persist refreshed signed URLs.
         */
        if (storedDocuments != null
                && hasNewStoragePaths(
                        storedDocuments,
                        refreshedDocuments
                )) {
            saveMediaColumn(
                    candidateId,
                    "documents",
                    writeJson(refreshedDocuments)
            );
        }

        return new ProfileMediaResponse(
                getMediaColumn(candidateId, "face_photo"),
                readJson(
                        getMediaColumn(candidateId, "gallery_images"),
                        new TypeReference<List<GalleryImage>>() {}
                ),
                refreshedDocuments,
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

    /**
     * Returns a newly generated signed URL for one of the authenticated
     * candidate's documents.
     *
     * The browser supplies a document ID, never a storage path or
     * candidate ID. The document and its storage path are resolved from
     * the authenticated candidate's own saved media.
     */
    @GetMapping("/media/documents/{documentId}/url")
    @Transactional
    public DocumentUrlResponse getFreshDocumentUrl(
            @PathVariable int documentId,
            Authentication authentication
    ) {
        UUID candidateId = findCandidateId(authentication);

        List<DocumentItem> documents = readJson(
                getMediaColumn(candidateId, "documents"),
                new TypeReference<List<DocumentItem>>() {}
        );

        if (documents == null || documents.isEmpty()) {
            throw new IllegalArgumentException(
                    "No documents were found in your profile."
            );
        }

        DocumentItem selectedDocument = documents.stream()
                .filter(document -> document.id() == documentId)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "The requested document was not found "
                                + "in your profile."
                ));

        String storagePath = selectedDocument.storagePath();

        /*
         * Older records may not have a storagePath field. Attempt to
         * recover it only from a trusted URL and a path belonging to
         * the currently authenticated candidate.
         */
        if (!isValidCandidateStoragePath(candidateId, storagePath)) {
            storagePath = recoverStoragePath(
                    candidateId,
                    selectedDocument.dataUrl()
            );
        }

        if (!isValidCandidateStoragePath(candidateId, storagePath)) {
            throw new IllegalStateException(
                    "The storage path for this document could not "
                            + "be recovered. Please upload the document "
                            + "again to restore access."
            );
        }

        /*
         * Save the durable path for legacy records. Do not save the
         * newly generated signed URL as the permanent document reference.
         */
        if (!storagePath.equals(selectedDocument.storagePath())) {
            List<DocumentItem> updatedDocuments = new ArrayList<>();

            for (DocumentItem document : documents) {
                if (document.id() == documentId) {
                    updatedDocuments.add(new DocumentItem(
                            document.id(),
                            document.name(),
                            document.status(),
                            document.fileName(),
                            document.fileSize(),
                            document.dataUrl(),
                            storagePath
                    ));
                } else {
                    updatedDocuments.add(document);
                }
            }

            saveMediaColumn(
                    candidateId,
                    "documents",
                    writeJson(updatedDocuments)
            );
        }

        String freshUrl = supabaseStorageService.createSignedUrl(
                DOCUMENTS_BUCKET,
                storagePath,
                SIGNED_URL_EXPIRY_SECONDS
        );

        return new DocumentUrlResponse(freshUrl);
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

    /**
     * Refresh signed URLs for documents that have a valid durable path.
     * Documents without a recoverable path are returned unchanged so
     * that one legacy document does not prevent the rest of the profile
     * from loading.
     */
    private List<DocumentItem> refreshDocumentUrls(
            UUID candidateId,
            List<DocumentItem> documents
    ) {
        if (documents == null) {
            return null;
        }

        List<DocumentItem> refreshed = new ArrayList<>();

        for (DocumentItem document : documents) {
            if (document == null) {
                continue;
            }

            String storagePath = document.storagePath();

            if (!isValidCandidateStoragePath(candidateId, storagePath)) {
                storagePath = recoverStoragePath(
                        candidateId,
                        document.dataUrl()
                );
            }

            if (!isValidCandidateStoragePath(candidateId, storagePath)) {
                refreshed.add(document);
                continue;
            }

            String freshUrl = supabaseStorageService.createSignedUrl(
                    DOCUMENTS_BUCKET,
                    storagePath,
                    SIGNED_URL_EXPIRY_SECONDS
            );

            refreshed.add(new DocumentItem(
                    document.id(),
                    document.name(),
                    document.status(),
                    document.fileName(),
                    document.fileSize(),
                    freshUrl,
                    storagePath
            ));
        }

        return refreshed;
    }

    private boolean hasNewStoragePaths(
            List<DocumentItem> original,
            List<DocumentItem> refreshed
    ) {
        if (original == null || refreshed == null) {
            return false;
        }

        for (DocumentItem updated : refreshed) {
            if (updated == null || updated.storagePath() == null) {
                continue;
            }

            for (DocumentItem previous : original) {
                if (previous != null
                        && previous.id() == updated.id()
                        && !updated.storagePath().equals(
                                previous.storagePath()
                        )) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Recover a storage path only when the URL:
     * - belongs to the configured Supabase host and port;
     * - uses the expected private-bucket signed-object route; and
     * - identifies a path beneath the authenticated candidate's folder.
     *
     * The JWT/token query string is never stored or reused.
     */
    private String recoverStoragePath(
            UUID candidateId,
            String existingUrl
    ) {
        if (existingUrl == null || existingUrl.isBlank()) {
            return null;
        }

        try {
            URI existingUri = URI.create(existingUrl.trim());
            URI configuredUri = URI.create(
                    supabaseUrl.endsWith("/")
                            ? supabaseUrl
                            : supabaseUrl + "/"
            );

            if (existingUri.getHost() == null
                    || configuredUri.getHost() == null
                    || !existingUri.getHost().equalsIgnoreCase(
                            configuredUri.getHost()
                    )
                    || !samePort(existingUri, configuredUri)
                    || !existingUri.getScheme().equalsIgnoreCase(
                            configuredUri.getScheme()
                    )) {
                return null;
            }

            String rawPath = existingUri.getRawPath();

            if (rawPath == null
                    || !rawPath.startsWith(
                            SIGNED_DOCUMENT_PATH_PREFIX
                    )) {
                return null;
            }

            String encodedStoragePath = rawPath.substring(
                    SIGNED_DOCUMENT_PATH_PREFIX.length()
            );

            if (encodedStoragePath.isBlank()) {
                return null;
            }

            String storagePath = URLDecoder.decode(
                    encodedStoragePath,
                    StandardCharsets.UTF_8
            );

            return isValidCandidateStoragePath(candidateId, storagePath)
                    ? storagePath
                    : null;

        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private boolean samePort(
            URI first,
            URI second
    ) {
        int firstPort = effectivePort(first);
        int secondPort = effectivePort(second);

        return firstPort == secondPort;
    }

    private int effectivePort(URI uri) {
        if (uri.getPort() != -1) {
            return uri.getPort();
        }

        if ("https".equalsIgnoreCase(uri.getScheme())) {
            return 443;
        }

        if ("http".equalsIgnoreCase(uri.getScheme())) {
            return 80;
        }

        return -1;
    }

    private boolean isValidCandidateStoragePath(
            UUID candidateId,
            String storagePath
    ) {
        if (candidateId == null
                || storagePath == null
                || storagePath.isBlank()) {
            return false;
        }

        String expectedPrefix = candidateId + "/";

        if (!storagePath.startsWith(expectedPrefix)) {
            return false;
        }

        if (storagePath.contains("\\")
                || storagePath.startsWith("/")
                || storagePath.contains("//")) {
            return false;
        }

        String[] segments = storagePath.split("/");

        for (String segment : segments) {
            if (segment.isBlank()
                    || ".".equals(segment)
                    || "..".equals(segment)) {
                return false;
            }
        }

        return segments.length >= 2;
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

    public record ProfileMediaResponse(
            String facePhoto,
            List<GalleryImage> galleryImages,
            List<DocumentItem> documents,
            List<ProjectItem> projects,
            IntroReelMeta reelMeta,
            Preferences preferences
    ) {
    }

    public record FullBodyPhotoUploadResponse(
            String fullBodyPhoto
    ) {
    }

    public record DocumentUrlResponse(
            String url
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

    /**
     * storagePath is the permanent document reference.
     * dataUrl is retained for compatibility with existing frontend code,
     * but it must be treated as a temporary signed URL.
     */
    public record DocumentItem(
            int id,
            String name,
            String status,
            String fileName,
            String fileSize,
            String dataUrl,
            String storagePath
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
