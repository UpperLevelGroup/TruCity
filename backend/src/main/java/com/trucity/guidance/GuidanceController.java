package com.trucity.guidance;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/guidance")
@RequiredArgsConstructor
public class GuidanceController {

    private final GuidanceContentService guidanceContentService;

    /**
     * Returns published guidance for exactly one audience.
     *
     * Examples:
     * GET /api/guidance?audience=ALL
     * GET /api/guidance?audience=CANDIDATE
     * GET /api/guidance?audience=COMPANY
     */
    @GetMapping
    public List<GuidanceContentService.GuidanceResponse> getPublishedGuidance(
            @RequestParam(
                    name = "audience",
                    defaultValue = "ALL"
            ) GuidanceContent.Audience audience
    ) {
        return guidanceContentService.getPublishedForAudience(audience);
    }
}
