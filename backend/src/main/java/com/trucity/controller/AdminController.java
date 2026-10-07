package com.trucity.controller;

import com.trucity.admin.AdminService;
import com.trucity.guidance.GuidanceContent;
import com.trucity.guidance.GuidanceContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final GuidanceContentService guidanceContentService;

    /*
     * =========================================================
     * CURRENT ADMIN ENDPOINTS
     * =========================================================
     */

    @GetMapping("/dashboard")
    public AdminService.DashboardResponse dashboard() {
        return adminService.getDashboard();
    }

    @GetMapping("/users")
    public List<AdminService.UserResponse> users() {
        return adminService.getUsers();
    }

    @GetMapping("/candidates")
    public List<AdminService.CandidateResponse> candidates() {
        return adminService.getCandidates();
    }

    @GetMapping("/employers")
    public List<AdminService.EmployerResponse> employers() {
        return adminService.getEmployers();
    }

    /*
     * =========================================================
     * GUIDANCE HUB ADMIN
     * =========================================================
     */

    @GetMapping("/guidance")
    public List<GuidanceContentService.GuidanceResponse> guidance() {
        return guidanceContentService.getAllForAdmin();
    }

    @PostMapping("/guidance")
    public GuidanceContentService.GuidanceResponse createGuidance(
            @RequestBody GuidanceContentService.CreateGuidanceRequest request
    ) {
        return guidanceContentService.create(request);
    }

    @PutMapping("/guidance/{id}")
    public GuidanceContentService.GuidanceResponse updateGuidance(
            @PathVariable UUID id,
            @RequestBody GuidanceContentService.UpdateGuidanceRequest request
    ) {
        return guidanceContentService.update(id, request);
    }

    @DeleteMapping("/guidance/{id}")
    public void deleteGuidance(
            @PathVariable UUID id
    ) {
        guidanceContentService.delete(id);
    }

    @PatchMapping("/guidance/{id}/publish")
    public GuidanceContentService.GuidanceResponse publishGuidance(
            @PathVariable UUID id,
            @RequestParam boolean published
    ) {
        return guidanceContentService.setPublished(
                id,
                published
        );
    }
}