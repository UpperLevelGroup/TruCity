package com.trucity.guidance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GuidanceContentRepository
        extends JpaRepository<GuidanceContent, UUID> {

    List<GuidanceContent> findAllByOrderByDisplayOrderAscCreatedAtDesc();

    List<GuidanceContent> findByPublishedTrueOrderByDisplayOrderAscCreatedAtDesc();

    List<GuidanceContent> findByAudienceAndPublishedTrueOrderByDisplayOrderAscCreatedAtDesc(
            GuidanceContent.Audience audience
    );

    List<GuidanceContent> findByContentTypeOrderByDisplayOrderAscCreatedAtDesc(
            GuidanceContent.ContentType contentType
    );

    List<GuidanceContent> findByAudienceOrderByDisplayOrderAscCreatedAtDesc(
            GuidanceContent.Audience audience
    );
}