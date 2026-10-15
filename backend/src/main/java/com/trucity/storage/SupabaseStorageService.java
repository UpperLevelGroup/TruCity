package com.trucity.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Service
public class SupabaseStorageService {

    private static final String PROFILE_IMAGES_BUCKET = "profile-images";
    private static final String INTRO_REEL_BUCKET = "candidate-profile-intro-reel";
    private static final String DOCUMENTS_BUCKET = "candidate-profile-documents";

    private final String supabaseUrl;
    private final String secretKey;
    private final RestClient restClient;

    public SupabaseStorageService(
            @Value("${supabase.url}") String supabaseUrl,
            @Value("${supabase.secret-key}") String secretKey
    ) {
        this.supabaseUrl = supabaseUrl;
        this.secretKey = secretKey;
        this.restClient = RestClient.builder().build();
    }

    public String uploadProfileImage(
            UUID candidateId,
            String imageType,
            byte[] fileBytes,
            String contentType
    ) {
        if (candidateId == null) {
            throw new IllegalArgumentException("Candidate ID is required.");
        }

        if (fileBytes == null || fileBytes.length == 0) {
            throw new IllegalArgumentException("Image file is empty.");
        }

        String extension = extensionForImage(contentType);
        String fileName = switch (imageType) {
            case "face" -> "face." + extension;
            case "full-body" -> "full-body." + extension;
            default -> throw new IllegalArgumentException(
                    "Unsupported profile image type: " + imageType
            );
        };

        String storagePath = candidateId + "/" + fileName;

        upload(
                PROFILE_IMAGES_BUCKET,
                storagePath,
                fileBytes,
                contentType
        );

        return supabaseUrl
                + "/storage/v1/object/public/"
                + PROFILE_IMAGES_BUCKET
                + "/"
                + storagePath;
    }

    public String uploadIntroReel(
            UUID candidateId,
            byte[] fileBytes,
            String contentType
    ) {
        validateFile(candidateId, fileBytes);

        String extension = extensionForVideo(contentType);
        String storagePath = candidateId + "/intro-reel." + extension;

        upload(
                INTRO_REEL_BUCKET,
                storagePath,
                fileBytes,
                contentType
        );

        return storagePath;
    }

    public String uploadDocument(
            UUID candidateId,
            String documentId,
            byte[] fileBytes,
            String contentType
    ) {
        validateFile(candidateId, fileBytes);

        String extension = extensionForDocument(contentType);
        String safeId = documentId == null || documentId.isBlank()
                ? "document"
                : documentId.replaceAll("[^a-zA-Z0-9_-]", "");

        String storagePath = candidateId + "/" + safeId + "." + extension;

        upload(
                DOCUMENTS_BUCKET,
                storagePath,
                fileBytes,
                contentType
        );

        return storagePath;
    }

    private void upload(
            String bucket,
            String storagePath,
            byte[] fileBytes,
            String contentType
    ) {
        String uploadUrl =
                supabaseUrl
                        + "/storage/v1/object/"
                        + bucket
                        + "/"
                        + storagePath;

        restClient
                .post()
                .uri(uploadUrl)
                .header("Authorization", "Bearer " + secretKey)
                .header("apikey", secretKey)
                .header("x-upsert", "true")
                .contentType(MediaType.parseMediaType(contentType))
                .body(fileBytes)
                .retrieve()
                .toBodilessEntity();

    }

    public String createSignedUrl(
            String bucket,
            String storagePath,
            int expiresInSeconds
    ) {
        if (bucket == null || bucket.isBlank()
                || storagePath == null || storagePath.isBlank()) {
            throw new IllegalArgumentException(
                    "Storage bucket and path are required."
            );
        }

        String signUrl =
                supabaseUrl
                        + "/storage/v1/object/sign/"
                        + bucket
                        + "/"
                        + storagePath;

        SignResponse response = restClient
                .post()
                .uri(signUrl)
                .header("Authorization", "Bearer " + secretKey)
                .header("apikey", secretKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(java.util.Map.of("expiresIn", expiresInSeconds))
                .retrieve()
                .body(SignResponse.class);

        if (response == null || response.signedURL() == null || response.signedURL().isBlank()) {
            throw new IllegalStateException(
                    "Supabase did not return a signed storage URL."
            );
        }

        String signedPath = response.signedURL();

        return signedPath.startsWith("http")
                ? signedPath
                : supabaseUrl + "/storage/v1" + signedPath;
    }

    private record SignResponse(String signedURL) {
    }

    private void validateFile(
            UUID candidateId,
            byte[] fileBytes
    ) {
        if (candidateId == null) {
            throw new IllegalArgumentException("Candidate ID is required.");
        }

        if (fileBytes == null || fileBytes.length == 0) {
            throw new IllegalArgumentException("File is empty.");
        }
    }

    private String extensionForImage(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> throw new IllegalArgumentException(
                    "Unsupported image type: " + contentType
            );
        };
    }

    private String extensionForVideo(String contentType) {
        return switch (contentType) {
            case "video/webm" -> "webm";
            case "video/mp4" -> "mp4";
            case "video/quicktime" -> "mov";
            default -> throw new IllegalArgumentException(
                    "Unsupported video type: " + contentType
            );
        };
    }

    private String extensionForDocument(String contentType) {
        return switch (contentType) {
            case "application/pdf" -> "pdf";
            case "image/png" -> "png";
            case "image/jpeg" -> "jpg";
            default -> throw new IllegalArgumentException(
                    "Unsupported document type: " + contentType
            );
        };
    }
}
