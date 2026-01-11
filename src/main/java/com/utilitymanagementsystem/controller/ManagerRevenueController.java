package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.manager.ManagerRevenueRecordDTO;
import com.utilitymanagementsystem.service.ManagerRevenueService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager/revenue")
public class ManagerRevenueController {

    private final ManagerRevenueService service;

    public ManagerRevenueController(ManagerRevenueService service) {
        this.service = service;
    }

    @PostMapping("/report")
    public List<ManagerRevenueRecordDTO> getRevenueReport(
            @RequestBody Map<String, String> payload
    ) {

        LocalDateTime start =
                LocalDateTime.parse(payload.get("startDate"));

        LocalDateTime end =
                LocalDateTime.parse(payload.get("endDate"));

        String utility =
                payload.getOrDefault("utilityType", "all");

        return service.getRevenue(start, end, utility);
    }
}