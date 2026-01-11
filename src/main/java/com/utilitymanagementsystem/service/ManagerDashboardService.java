package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.manager.ManagerDashboardSummaryDTO;
import com.utilitymanagementsystem.repository.ManagerDashboardRepository;
import org.springframework.stereotype.Service;

@Service
public class ManagerDashboardService {

    private final ManagerDashboardRepository dashboardRepository;

    public ManagerDashboardService(ManagerDashboardRepository dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }

    public ManagerDashboardSummaryDTO getDashboardSummary() {

        double totalRevenue = dashboardRepository.getTotalRevenue();
        double totalUnpaid = dashboardRepository.getTotalUnpaid();
        long totalCustomers = dashboardRepository.getTotalCustomers();

        return new ManagerDashboardSummaryDTO(
                totalRevenue,
                totalUnpaid,
                totalCustomers
        );
    }
}
