package com.trucity.controller;

import com.trucity.company.hub.CompanyHubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

@RestController @RequiredArgsConstructor
public class CompanyHubController {
    private final CompanyHubService service;

    @GetMapping("/api/company/hub") @PreAuthorize("hasRole('EMPLOYER')")
    public List<CompanyHubService.ContentResponse> employerContent() { return service.employerContent(); }

    @PostMapping("/api/company/hub") @PreAuthorize("hasRole('EMPLOYER')")
    public CompanyHubService.ContentResponse create(@RequestBody CompanyHubService.ContentRequest request) { return service.create(request); }

    @PutMapping("/api/company/hub/{id}") @PreAuthorize("hasRole('EMPLOYER')")
    public CompanyHubService.ContentResponse update(@PathVariable UUID id, @RequestBody CompanyHubService.ContentRequest request) { return service.update(id, request); }

    @PostMapping("/api/company/hub/{id}/publish") @PreAuthorize("hasRole('EMPLOYER')")
    public CompanyHubService.ContentResponse publish(@PathVariable UUID id, @RequestParam(defaultValue = "true") boolean publish) { return service.publish(id, publish); }

    @DeleteMapping("/api/company/hub/{id}") @PreAuthorize("hasRole('EMPLOYER')")
    public void delete(@PathVariable UUID id) { service.delete(id); }

    @PostMapping(value = "/api/company/hub/{id}/media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE) @PreAuthorize("hasRole('EMPLOYER')")
    public CompanyHubService.ContentResponse upload(@PathVariable UUID id, @RequestPart("file") MultipartFile file) { return service.upload(id, file); }

    @GetMapping("/api/candidate/company-hub") @PreAuthorize("hasRole('CANDIDATE')")
    public List<CompanyHubService.ContentResponse> candidateFeed() { return service.publishedContent(); }
}
