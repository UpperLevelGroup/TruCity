package com.trucity.company.hub;

import com.trucity.company.Company;
import com.trucity.company.CompanyRepository;
import com.trucity.company.EmployerProfile;
import com.trucity.company.EmployerProfileRepository;
import com.trucity.storage.CompanyHubStorageService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service @RequiredArgsConstructor @Transactional
public class CompanyHubService {
    private final CompanyHubContentRepository contentRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final CompanyRepository companyRepository;
    private final CompanyHubStorageService storageService;

    @Transactional(readOnly = true)
    public List<ContentResponse> employerContent() {
        UUID companyId = currentCompanyId();
        return contentRepository.findAllByCompanyIdOrderByUpdatedAtDesc(companyId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ContentResponse> publishedContent() {
        return contentRepository.findAllByStatusOrderByPublishedAtDesc("PUBLISHED").stream().map(this::toResponse).toList();
    }

    public ContentResponse create(ContentRequest request) {
        validate(request);
        CompanyHubContent item = CompanyHubContent.builder().companyId(currentCompanyId()).title(request.title().trim())
                .summary(clean(request.summary())).body(clean(request.body())).contentType(normalizeType(request.contentType()))
                .category(clean(request.category())).eventStartsAt(request.eventStartsAt()).eventEndsAt(request.eventEndsAt())
                .eventLocation(clean(request.eventLocation())).status("DRAFT").build();
        return toResponse(contentRepository.save(item));
    }

    public ContentResponse update(UUID id, ContentRequest request) {
        validate(request);
        CompanyHubContent item = owned(id);
        item.setTitle(request.title().trim()); item.setSummary(clean(request.summary())); item.setBody(clean(request.body()));
        item.setContentType(normalizeType(request.contentType())); item.setCategory(clean(request.category()));
        item.setEventStartsAt(request.eventStartsAt()); item.setEventEndsAt(request.eventEndsAt());
        item.setEventLocation(clean(request.eventLocation()));
        return toResponse(contentRepository.save(item));
    }

    public ContentResponse publish(UUID id, boolean publish) {
        CompanyHubContent item = owned(id);
        item.setStatus(publish ? "PUBLISHED" : "DRAFT");
        item.setPublishedAt(publish ? LocalDateTime.now() : null);
        return toResponse(contentRepository.save(item));
    }

    public void delete(UUID id) { contentRepository.delete(owned(id)); }

    public ContentResponse upload(UUID id, MultipartFile file) {
        CompanyHubContent item = owned(id);
        CompanyHubStorageService.StoredMedia media = storageService.upload(item.getCompanyId(), file);
        item.setMediaPath(media.publicUrl()); item.setMediaContentType(media.contentType()); item.setMediaOriginalName(media.originalName());
        return toResponse(contentRepository.save(item));
    }

    private UUID currentCompanyId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required.");
        EmployerProfile profile = employerProfileRepository.findByEmployerEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "No employer profile is linked to this account."));
        Company company = companyRepository.findById(profile.getCompanyId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "No company is linked to this employer."));
        return company.getId();
    }

    private CompanyHubContent owned(UUID id) {
        return contentRepository.findByIdAndCompanyId(id, currentCompanyId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company Hub content was not found."));
    }

    private void validate(ContentRequest request) {
        if (request == null || request.title() == null || request.title().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required.");
        if (request.title().trim().length() > 180) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title must be 180 characters or fewer.");
        if (request.summary() != null && request.summary().length() > 500) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Summary must be 500 characters or fewer.");
        if (request.eventStartsAt() != null && request.eventEndsAt() != null && request.eventEndsAt().isBefore(request.eventStartsAt())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event end must be after the start.");
        normalizeType(request.contentType());
    }

    private String normalizeType(String value) {
        String type = value == null ? "STORY" : value.trim().toUpperCase(Locale.ROOT);
        if (!List.of("STORY", "NEWS", "SEMINAR", "WEBINAR", "TRAINING", "VIDEO").contains(type)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported Company Hub content type.");
        return type;
    }
    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private ContentResponse toResponse(CompanyHubContent item) {
        String companyName = companyRepository.findById(item.getCompanyId()).map(Company::getName).orElse("TruCity Employer");
        return new ContentResponse(item.getId(), item.getCompanyId(), companyName, item.getTitle(), item.getSummary(), item.getBody(), item.getContentType(), item.getCategory(), item.getEventStartsAt(), item.getEventEndsAt(), item.getEventLocation(), item.getMediaPath(), item.getMediaContentType(), item.getMediaOriginalName(), item.getStatus(), item.getPublishedAt(), item.getCreatedAt(), item.getUpdatedAt());
    }

    public record ContentRequest(String title, String summary, String body, String contentType, String category, LocalDateTime eventStartsAt, LocalDateTime eventEndsAt, String eventLocation) {}
    public record ContentResponse(UUID id, UUID companyId, String companyName, String title, String summary, String body, String contentType, String category, LocalDateTime eventStartsAt, LocalDateTime eventEndsAt, String eventLocation, String mediaUrl, String mediaContentType, String mediaOriginalName, String status, LocalDateTime publishedAt, LocalDateTime createdAt, LocalDateTime updatedAt) {}
}
