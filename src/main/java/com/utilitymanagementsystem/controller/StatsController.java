package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.manager.*;
import com.utilitymanagementsystem.dto.stats.AdminDashboardStatDTO;
import com.utilitymanagementsystem.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/admin-dashboard")
    public ResponseEntity<AdminDashboardStatDTO> getAdminStats() {
        return ResponseEntity.ok(statsService.getAdminStats());
    }

}
