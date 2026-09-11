package com.trucity.controller;

import com.trucity.admin.AdminSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSettingsController {

    private final AdminSettingsService settingsService;

    @GetMapping
    public AdminSettingsService.SettingsResponse getSettings() {
        return settingsService.getSettings();
    }

    @PatchMapping("/platform")
    public AdminSettingsService.SettingsResponse updatePlatform(
            @RequestBody AdminSettingsService.PlatformSettingsRequest request,
            Authentication authentication
    ) {
        return settingsService.updatePlatform(request, authentication);
    }

    @PatchMapping("/users")
    public AdminSettingsService.SettingsResponse updateUsers(
            @RequestBody AdminSettingsService.UserSettingsRequest request,
            Authentication authentication
    ) {
        return settingsService.updateUsers(request, authentication);
    }

    @PatchMapping("/jobs")
    public AdminSettingsService.SettingsResponse updateJobs(
            @RequestBody AdminSettingsService.JobSettingsRequest request,
            Authentication authentication
    ) {
        return settingsService.updateJobs(request, authentication);
    }

    @PatchMapping("/verification")
    public AdminSettingsService.SettingsResponse updateVerification(
            @RequestBody AdminSettingsService.VerificationSettingsRequest request,
            Authentication authentication
    ) {
        return settingsService.updateVerification(request, authentication);
    }

    @PatchMapping("/applications")
    public AdminSettingsService.SettingsResponse updateApplications(
            @RequestBody AdminSettingsService.ApplicationSettingsRequest request,
            Authentication authentication
    ) {
        return settingsService.updateApplications(request, authentication);
    }

    @PatchMapping("/notifications")
    public AdminSettingsService.SettingsResponse updateNotifications(
            @RequestBody AdminSettingsService.NotificationSettingsRequest request,
            Authentication authentication
    ) {
        return settingsService.updateNotifications(request, authentication);
    }

    @PatchMapping("/security")
    public AdminSettingsService.SettingsResponse updateSecurity(
            @RequestBody AdminSettingsService.SecuritySettingsRequest request,
            Authentication authentication
    ) {
        return settingsService.updateSecurity(request, authentication);
    }

    @GetMapping("/roles")
    public List<AdminSettingsService.RoleResponse> getRoles() {
        return settingsService.getRoles();
    }

    @GetMapping("/permissions")
    public List<AdminSettingsService.PermissionResponse> getPermissions() {
        return settingsService.getPermissions();
    }

    @PatchMapping("/roles/{roleId}/permissions")
    public List<AdminSettingsService.RoleResponse> updateRolePermissions(
            @PathVariable UUID roleId,
            @RequestBody AdminSettingsService.RolePermissionsRequest request,
            Authentication authentication
    ) {
        return settingsService.updateRolePermissions(
                roleId,
                request,
                authentication
        );
    }

    @GetMapping("/audit")
    public List<AdminSettingsService.AuditResponse> getAuditLogs() {
        return settingsService.getRecentAuditLogs();
    }

    @GetMapping("/system")
    public AdminSettingsService.SystemResponse getSystemInformation() {
        return settingsService.getSystemInformation();
    }
}