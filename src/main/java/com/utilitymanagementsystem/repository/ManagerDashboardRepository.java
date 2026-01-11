package com.utilitymanagementsystem.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ManagerDashboardRepository {

    private final JdbcTemplate jdbcTemplate;

    public ManagerDashboardRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public double getTotalRevenue() {
        String sql = "SELECT ISNULL(SUM(amount), 0) FROM payment";
        return jdbcTemplate.queryForObject(sql, Double.class);
    }

    public double getTotalUnpaid() {
        String sql = "SELECT ISNULL(SUM(outstanding_amount), 0) FROM bill";
        return jdbcTemplate.queryForObject(sql, Double.class);
    }

    public long getTotalCustomers() {
        String sql = "SELECT COUNT(*) FROM customer";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }
}
