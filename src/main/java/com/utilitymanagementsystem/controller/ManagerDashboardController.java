package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.manager.ManagerDashboardSummaryDTO;
import com.utilitymanagementsystem.service.ManagerDashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/manager")
public class ManagerDashboardController {

    private final ManagerDashboardService dashboardService;

    public ManagerDashboardController(ManagerDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    public ManagerDashboardSummaryDTO getDashboardSummary() {
        return dashboardService.getDashboardSummary();
    }
}
