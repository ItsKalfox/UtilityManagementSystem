package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.dto.manager.ManagerRevenueRecordDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public class ManagerRevenueRepository {

    private final JdbcTemplate jdbcTemplate;

    public ManagerRevenueRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ManagerRevenueRecordDTO> getRevenue(
            LocalDateTime startDate,
            LocalDateTime endDate,
            String utilityType
    ) {

        String sql = """
            SELECT 
                b.bill_id,
                u.full_name AS customer_name,
                uc.utility_type,
                p.amount,
                b.status,
                p.payment_date
            FROM payment p
            JOIN bill b ON p.bill_id = b.bill_id
            JOIN utility_connection uc ON b.connection_id = uc.connection_id
            JOIN customer c ON uc.customer_id = c.user_id
            JOIN users u ON c.user_id = u.user_id
            WHERE p.payment_date BETWEEN ? AND ?
        """;

        if (utilityType != null && !utilityType.equalsIgnoreCase("all")) {
            sql += " AND uc.utility_type = ?";
        }

        return jdbcTemplate.query(
                sql,
                utilityType != null && !utilityType.equalsIgnoreCase("all")
                        ? new Object[]{
                        Timestamp.valueOf(startDate),
                        Timestamp.valueOf(endDate),
                        utilityType
                }
                        : new Object[]{
                        Timestamp.valueOf(startDate),
                        Timestamp.valueOf(endDate)
                },
                (rs, rowNum) -> new ManagerRevenueRecordDTO(
                        rs.getInt("bill_id"),
                        rs.getString("customer_name"),
                        rs.getString("utility_type"),
                        rs.getDouble("amount"),
                        rs.getString("status"),
                        rs.getTimestamp("payment_date").toLocalDateTime()
                )
        );
    }
}
