package com.trucity.controller;

import com.trucity.admin.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

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
}