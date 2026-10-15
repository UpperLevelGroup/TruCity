package com.trucity.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.io.IOException;
import java.util.UUID;

@Service
public class CompanyHubStorageService {
    private final RestClient client;
    private final String supabaseUrl;
    private final String secretKey;

    public CompanyHubStorageService(
            @Value("${supabase.url}") String supabaseUrl,
            @Value("${supabase.secret-key}") String secretKey) {
        this.supabaseUrl = supabaseUrl.replaceAll("/$", "");
        this.secretKey = secretKey;
        this.client = RestClient.builder().baseUrl(this.supabaseUrl).build();
    }

    public StoredMedia upload(UUID companyId, MultipartFile file) {
        if (file == null || file.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a file to upload.");
        if (file.getSize() > 50L * 1024 * 1024) throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Maximum file size is 50 MB.");
        String type = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        String bucket;
        String extension;
        if (type.equals("image/jpeg")) { bucket = "company-hub-images"; extension = ".jpg"; }
        else if (type.equals("image/png")) { bucket = "company-hub-images"; extension = ".png"; }
        else if (type.equals("image/webp")) { bucket = "company-hub-images"; extension = ".webp"; }
        else if (type.equals("video/mp4")) { bucket = "company-hub-videos"; extension = ".mp4"; }
        else if (type.equals("video/webm")) { bucket = "company-hub-videos"; extension = ".webm"; }
        else if (type.equals("video/quicktime")) { bucket = "company-hub-videos"; extension = ".mov"; }
        else throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Supported formats: JPG, PNG, WEBP, MP4, WEBM or MOV.");

        String path = companyId + "/" + UUID.randomUUID() + extension;
        byte[] bytes;
        try { bytes = file.getBytes(); }
        catch (IOException e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to read uploaded file."); }

        client.post().uri("/storage/v1/object/" + bucket + "/" + path)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + secretKey)
                .header("apikey", secretKey)
                .header("x-upsert", "false")
                .contentType(MediaType.parseMediaType(type))
                .body(bytes).retrieve().toBodilessEntity();
        String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + path;
        return new StoredMedia(bucket, path, type, safeName(file.getOriginalFilename()), publicUrl);
    }

    private String safeName(String value) {
        if (value == null || value.isBlank()) return "upload";
        String clean = value.replaceAll("[\\/\r\n]", "_");
        return clean.length() > 255 ? clean.substring(clean.length() - 255) : clean;
    }

    public record StoredMedia(String bucket, String path, String contentType, String originalName, String publicUrl) {}
}
