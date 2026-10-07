package com.trucity.guidance;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class GuidanceContentService {

    private final GuidanceContentRepository guidanceContentRepository;

    /*
     * =========================================================
     * ADMIN - GET ALL CONTENT
     * =========================================================
     */

    @Transactional(readOnly = true)
    public List<GuidanceResponse> getAllForAdmin() {
        return guidanceContentRepository
                .findAllByOrderByDisplayOrderAscCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
     * =========================================================
     * ADMIN - CREATE
     * =========================================================
     */

    public GuidanceResponse create(CreateGuidanceRequest request) {

        validateRequest(request.title(), request.category());

        GuidanceContent content = GuidanceContent.builder()
                .title(request.title().trim())
                .contentType(request.contentType())
                .audience(request.audience())
                .category(request.category().trim())
                .description(clean(request.description()))
                .content(clean(request.content()))
                .mediaUrl(clean(request.mediaUrl()))
                .duration(clean(request.duration()))
                .readingTime(clean(request.readingTime()))
                .icon(clean(request.icon()))
                .published(Boolean.TRUE.equals(request.published()))
                .featured(Boolean.TRUE.equals(request.featured()))
                .displayOrder(
                        request.displayOrder() == null
                                ? 0
                                : request.displayOrder()
                )
                .build();

        GuidanceContent saved = guidanceContentRepository.save(content);

        return toResponse(saved);
    }

    /*
     * =========================================================
     * ADMIN - UPDATE
     * =========================================================
     */

    public GuidanceResponse update(
            UUID id,
            UpdateGuidanceRequest request
    ) {

        GuidanceContent content = guidanceContentRepository
                .findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Guidance content not found: " + id
                        )
                );

        validateRequest(request.title(), request.category());

        content.setTitle(request.title().trim());
        content.setContentType(request.contentType());
        content.setAudience(request.audience());
        content.setCategory(request.category().trim());
        content.setDescription(clean(request.description()));
        content.setContent(clean(request.content()));
        content.setMediaUrl(clean(request.mediaUrl()));
        content.setDuration(clean(request.duration()));
        content.setReadingTime(clean(request.readingTime()));
        content.setIcon(clean(request.icon()));

        if (request.published() != null) {
            content.setPublished(request.published());
        }

        if (request.featured() != null) {
            content.setFeatured(request.featured());
        }

        if (request.displayOrder() != null) {
            content.setDisplayOrder(request.displayOrder());
        }

        GuidanceContent saved = guidanceContentRepository.save(content);

        return toResponse(saved);
    }

    /*
     * =========================================================
     * ADMIN - DELETE
     * =========================================================
     */

    public void delete(UUID id) {

        if (!guidanceContentRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Guidance content not found: " + id
            );
        }

        guidanceContentRepository.deleteById(id);
    }

    /*
     * =========================================================
     * ADMIN - PUBLISH / UNPUBLISH
     * =========================================================
     */

    public GuidanceResponse setPublished(
            UUID id,
            boolean published
    ) {

        GuidanceContent content = guidanceContentRepository
                .findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Guidance content not found: " + id
                        )
                );

        content.setPublished(published);

        GuidanceContent saved = guidanceContentRepository.save(content);

        return toResponse(saved);
    }

    /*
     * =========================================================
     * PUBLIC CONTENT
     *
     * These methods will be used later by the Candidate and
     * Company Guidance Hubs.
     * =========================================================
     */

    @Transactional(readOnly = true)
    public List<GuidanceResponse> getPublished() {

        return guidanceContentRepository
                .findByPublishedTrueOrderByDisplayOrderAscCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GuidanceResponse> getPublishedForAudience(
            GuidanceContent.Audience audience
    ) {

        return guidanceContentRepository
                .findByAudienceAndPublishedTrueOrderByDisplayOrderAscCreatedAtDesc(
                        audience
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
     * =========================================================
     * VALIDATION
     * =========================================================
     */

    private void validateRequest(
            String title,
            String category
    ) {

        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException(
                    "Guidance title is required."
            );
        }

        if (category == null || category.isBlank()) {
            throw new IllegalArgumentException(
                    "Guidance category is required."
            );
        }
    }

    private String clean(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();

        return trimmed.isEmpty()
                ? null
                : trimmed;
    }

    /*
     * =========================================================
     * ENTITY -> RESPONSE
     * =========================================================
     */

    private GuidanceResponse toResponse(GuidanceContent content) {

        return new GuidanceResponse(
                content.getId(),
                content.getTitle(),
                content.getContentType(),
                content.getAudience(),
                content.getCategory(),
                content.getDescription(),
                content.getContent(),
                content.getMediaUrl(),
                content.getDuration(),
                content.getReadingTime(),
                content.getIcon(),
                content.getPublished(),
                content.getFeatured(),
                content.getDisplayOrder(),
                content.getCreatedAt(),
                content.getUpdatedAt()
        );
    }

    /*
     * =========================================================
     * REQUEST / RESPONSE DTOs
     * =========================================================
     */

    public record CreateGuidanceRequest(
            String title,
            GuidanceContent.ContentType contentType,
            GuidanceContent.Audience audience,
            String category,
            String description,
            String content,
            String mediaUrl,
            String duration,
            String readingTime,
            String icon,
            Boolean published,
            Boolean featured,
            Integer displayOrder
    ) {
    }

    public record UpdateGuidanceRequest(
            String title,
            GuidanceContent.ContentType contentType,
            GuidanceContent.Audience audience,
            String category,
            String description,
            String content,
            String mediaUrl,
            String duration,
            String readingTime,
            String icon,
            Boolean published,
            Boolean featured,
            Integer displayOrder
    ) {
    }

    public record GuidanceResponse(
            UUID id,
            String title,
            GuidanceContent.ContentType contentType,
            GuidanceContent.Audience audience,
            String category,
            String description,
            String content,
            String mediaUrl,
            String duration,
            String readingTime,
            String icon,
            Boolean published,
            Boolean featured,
            Integer displayOrder,
            java.time.LocalDateTime createdAt,
            java.time.LocalDateTime updatedAt
    ) {
    }
}