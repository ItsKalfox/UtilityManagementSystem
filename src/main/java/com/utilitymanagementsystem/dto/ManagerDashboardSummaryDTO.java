package com.utilitymanagementsystem.dto.manager;

public class ManagerDashboardSummaryDTO {

    private double totalRevenue;
    private double totalUnpaid;
    private long totalCustomers;

    public ManagerDashboardSummaryDTO(double totalRevenue, double totalUnpaid, long totalCustomers) {
        this.totalRevenue = totalRevenue;
        this.totalUnpaid = totalUnpaid;
        this.totalCustomers = totalCustomers;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public double getTotalUnpaid() {
        return totalUnpaid;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }
}

