package com.trucity.company.hub;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "company_hub_content")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CompanyHubContent {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(length = 500)
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(name = "content_type", nullable = false, length = 30)
    private String contentType;

    @Column(length = 80)
    private String category;

    @Column(name = "event_starts_at")
    private LocalDateTime eventStartsAt;

    @Column(name = "event_ends_at")
    private LocalDateTime eventEndsAt;

    @Column(name = "event_location", length = 250)
    private String eventLocation;

    @Column(name = "media_path", length = 500)
    private String mediaPath;

    @Column(name = "media_content_type", length = 100)
    private String mediaContentType;

    @Column(name = "media_original_name", length = 255)
    private String mediaOriginalName;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (contentType == null) contentType = "STORY";
        if (status == null) status = "DRAFT";
    }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }
}
