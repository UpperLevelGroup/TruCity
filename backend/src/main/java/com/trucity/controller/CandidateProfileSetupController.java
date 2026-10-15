package com.trucity.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trucity.storage.SupabaseStorageService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidate/profile/setup")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CANDIDATE')")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateProfileSetupController {

    private static final String INTRO_REEL_BUCKET =
            "candidate-profile-intro-reel";

    private static final String DOCUMENTS_BUCKET =
            "candidate-profile-documents";

    private static final long MAX_REEL_SIZE =
            50L * 1024L * 1024L;

    private static final long MAX_DOCUMENT_SIZE =
            50L * 1024L * 1024L;

    @PersistenceContext
    private EntityManager entityManager;

    private final ObjectMapper objectMapper;
    private final SupabaseStorageService supabaseStorageService;

    @GetMapping
    @Transactional
    public ProfileSetupResponse getSetup(
            Authentication authentication
    ) {
        UUID candidateId = findCandidateId(authentication);

        ensureDetailsRow(candidateId);

        Object[] row = (Object[]) entityManager.createNativeQuery("""
                SELECT
                    id_number,
                    industry,
                    experience_range,
                    face_photo,
                    full_body_photo,
                    intro_reel
                FROM candidate_profile_details
                WHERE candidate_id = :candidateId
                LIMIT 1
                """)
                .setParameter("candidateId", candidateId)
                .getSingleResult();

        return new ProfileSetupResponse(
                toStringValue(row[0]),
                toStringValue(row[1]),
                toStringValue(row[2]),
                toStringValue(row[3]),
                toStringValue(row[4]),
                readIntroReel(toStringValue(row[5]))
        );
    }

    @PostMapping(
            value = "/upload/reel",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Transactional
    public IntroReelMeta uploadIntroReel(
            @RequestPart("file") MultipartFile file,
            Authentication authentication
    ) throws IOException {

        UUID candidateId = findCandidateId(authentication);

        validateFile(file, MAX_REEL_SIZE);

        String contentType = file.getContentType();

        if (contentType == null
                || !(contentType.equals("video/webm")
                || contentType.equals("video/mp4")
                || contentType.equals("video/quicktime"))) {
            throw new IllegalArgumentException(
                    "Intro reel must be WEBM, MP4 or MOV video."
            );
        }

        String storagePath = supabaseStorageService.uploadIntroReel(
                candidateId,
                file.getBytes(),
                contentType
        );

        String signedUrl = supabaseStorageService.createSignedUrl(
                INTRO_REEL_BUCKET,
                storagePath,
                3600
        );

        IntroReelMeta metadata = new IntroReelMeta(
                file.getOriginalFilename() == null
                        || file.getOriginalFilename().isBlank()
                        ? "candidate-intro-reel."
                        + extensionForVideo(contentType)
                        : file.getOriginalFilename(),
                formatFileSize(file.getSize()),
                Instant.now().toString(),
                signedUrl,
                storagePath
        );

        ensureDetailsRow(candidateId);

        String metadataJson = writeJson(metadata);

        /*
         * Keep both columns synchronized.
         *
         * intro_reel is used by candidate onboarding.
         * reel_meta is used by the Profile media endpoint.
         */
        entityManager.createNativeQuery("""
                UPDATE candidate_profile_details
                SET intro_reel = :introReel,
                    reel_meta = :reelMeta,
                    updated_at = NOW()
                WHERE candidate_id = :candidateId
                """)
                .setParameter("introReel", metadataJson)
                .setParameter("reelMeta", metadataJson)
                .setParameter("candidateId", candidateId)
                .executeUpdate();

        return metadata;
    }

    @PostMapping(
            value = "/upload/document",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public DocumentUploadResponse uploadDocument(
            @RequestPart("file") MultipartFile file,
            @RequestPart("documentId") String documentId,
            Authentication authentication
    ) throws IOException {

        UUID candidateId = findCandidateId(authentication);

        validateFile(file, MAX_DOCUMENT_SIZE);

        if (documentId == null || documentId.isBlank()) {
            throw new IllegalArgumentException(
                    "Document ID is required."
            );
        }

        String contentType = file.getContentType();

        if (contentType == null
                || !(contentType.equals("application/pdf")
                || contentType.equals("image/png")
                || contentType.equals("image/jpeg"))) {
            throw new IllegalArgumentException(
                    "Document must be a PDF, PNG or JPEG file."
            );
        }

        /*
         * Store the document in the private Supabase bucket.
         * The storage path is the durable reference.
         * The signed URL is temporary and must not be used
         * as the permanent document identifier.
         */
        String storagePath = supabaseStorageService.uploadDocument(
                candidateId,
                documentId,
                file.getBytes(),
                contentType
        );

        /*
         * Return a temporary URL for immediate preview.
         * The frontend must also retain storagePath.
         * A fresh URL should be generated when the document
         * is opened later.
         */
        String signedUrl = supabaseStorageService.createSignedUrl(
                DOCUMENTS_BUCKET,
                storagePath,
                3600
        );

        return new DocumentUploadResponse(
                signedUrl,
                storagePath
        );
    }

    @PutMapping
    @Transactional
    @ResponseStatus(HttpStatus.OK)
    public ProfileSetupResponse saveSetup(
            @RequestBody ProfileSetupRequest request,
            Authentication authentication
    ) {
        UUID candidateId = findCandidateId(authentication);

        if (request == null) {
            throw new IllegalArgumentException(
                    "Candidate profile setup data is required."
            );
        }

        ensureDetailsRow(candidateId);

        /*
         * Prevent a Base64 image submitted by onboarding from
         * overwriting an existing full-body photo URL.
         *
         * COALESCE preserves the existing database value when
         * incomingFullBodyPhoto is null.
         */
        String incomingFullBodyPhoto = request.fullBodyPhoto();

        if (incomingFullBodyPhoto != null
                && incomingFullBodyPhoto.trim()
                .toLowerCase(Locale.ROOT)
                .startsWith("data:image/")) {
            incomingFullBodyPhoto = null;
        }

        if (request.introReel() == null) {
            entityManager.createNativeQuery("""
                    UPDATE candidate_profile_details
                    SET id_number = :idNumber,
                        industry = :industry,
                        experience_range = :experienceRange,
                        face_photo = :facePhoto,
                        full_body_photo = COALESCE(
                            :fullBodyPhoto,
                            full_body_photo
                        ),
                        updated_at = NOW()
                    WHERE candidate_id = :candidateId
                    """)
                    .setParameter(
                            "idNumber",
                            clean(request.idNumber())
                    )
                    .setParameter(
                            "industry",
                            clean(request.industry())
                    )
                    .setParameter(
                            "experienceRange",
                            clean(request.experience())
                    )
                    .setParameter(
                            "facePhoto",
                            request.facePhoto()
                    )
                    .setParameter(
                            "fullBodyPhoto",
                            incomingFullBodyPhoto
                    )
                    .setParameter("candidateId", candidateId)
                    .executeUpdate();
        } else {
            String metadataJson = writeJson(request.introReel());

            entityManager.createNativeQuery("""
                    UPDATE candidate_profile_details
                    SET id_number = :idNumber,
                        industry = :industry,
                        experience_range = :experienceRange,
                        face_photo = :facePhoto,
                        full_body_photo = COALESCE(
                            :fullBodyPhoto,
                            full_body_photo
                        ),
                        intro_reel = :introReel,
                        reel_meta = :reelMeta,
                        updated_at = NOW()
                    WHERE candidate_id = :candidateId
                    """)
                    .setParameter(
                            "idNumber",
                            clean(request.idNumber())
                    )
                    .setParameter(
                            "industry",
                            clean(request.industry())
                    )
                    .setParameter(
                            "experienceRange",
                            clean(request.experience())
                    )
                    .setParameter(
                            "facePhoto",
                            request.facePhoto()
                    )
                    .setParameter(
                            "fullBodyPhoto",
                            incomingFullBodyPhoto
                    )
                    .setParameter("introReel", metadataJson)
                    .setParameter("reelMeta", metadataJson)
                    .setParameter("candidateId", candidateId)
                    .executeUpdate();
        }

        return getSetup(authentication);
    }

    private IntroReelMeta readIntroReel(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            IntroReelMeta metadata = objectMapper.readValue(
                    value,
                    IntroReelMeta.class
            );

            /*
             * Older reel metadata may not contain storagePath.
             * Preserve it rather than attempting to construct
             * an invalid storage URL.
             */
            if (metadata.storagePath() == null
                    || metadata.storagePath().isBlank()) {
                return metadata;
            }

            String signedUrl = supabaseStorageService.createSignedUrl(
                    INTRO_REEL_BUCKET,
                    metadata.storagePath(),
                    3600
            );

            return new IntroReelMeta(
                    metadata.fileName(),
                    metadata.fileSize(),
                    metadata.uploadedAt(),
                    signedUrl,
                    metadata.storagePath()
            );
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(
                    "Stored candidate intro reel data is invalid.",
                    e
            );
        }
    }

    private UUID findCandidateId(Authentication authentication) {
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
                JOIN users u ON u.id = cp.user_id
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

    private void ensureDetailsRow(UUID candidateId) {
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
                    VALUES (:candidateId, NOW())
                    """)
                    .setParameter("candidateId", candidateId)
                    .executeUpdate();
        }
    }

    private void validateFile(
            MultipartFile file,
            long maxBytes
    ) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "File is required."
            );
        }

        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException(
                    "File must be smaller than 50 MB."
            );
        }
    }

    private static String extensionForVideo(String contentType) {
        return switch (contentType) {
            case "video/webm" -> "webm";
            case "video/mp4" -> "mp4";
            case "video/quicktime" -> "mov";
            default -> "mp4";
        };
    }

    private static String formatFileSize(long bytes) {
        return String.format(
                Locale.ROOT,
                "%.1f MB",
                bytes / (1024.0 * 1024.0)
        );
    }

    private String writeJson(Object value) {
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

    private static String toStringValue(Object value) {
        return value == null ? null : value.toString();
    }

    private static UUID toUuid(Object value) {
        if (value instanceof UUID uuid) {
            return uuid;
        }

        return value == null
                ? null
                : UUID.fromString(value.toString());
    }

    public record ProfileSetupRequest(
            String idNumber,
            String industry,
            String experience,
            String facePhoto,
            String fullBodyPhoto,
            IntroReelMeta introReel
    ) {}

    public record DocumentUploadResponse(
            String dataUrl,
            String storagePath
    ) {}

    public record ProfileSetupResponse(
            String idNumber,
            String industry,
            String experience,
            String facePhoto,
            String fullBodyPhoto,
            IntroReelMeta introReel
    ) {}

    public record IntroReelMeta(
            String fileName,
            String fileSize,
            String uploadedAt,
            String dataUrl,
            String storagePath
    ) {}
}