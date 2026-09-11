package com.trucity.controller;

import com.trucity.report.AdminReportResponse;
import com.trucity.report.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {

    private final AdminReportService adminReportService;


    @GetMapping
    public AdminReportResponse getReport(

            @RequestParam(
                    defaultValue = "30"
            )
            int period

    ) {

        return adminReportService.getReport(
                period
        );
    }
}