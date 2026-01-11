package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.dto.manager.DefaulterRowView;
import com.utilitymanagementsystem.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ManagerBillingRepository extends JpaRepository<Bill, Integer> {
    @Query("""
        SELECT
          c.userId AS customerId,
          u.fullName AS fullName,
          a.areaCode AS areaCode,
          a.areaName AS areaName,
          SUM(b.outstandingAmount) AS totalOutstanding
        FROM Bill b
          JOIN b.connection uc
          JOIN uc.customer c
          JOIN c.user u
          JOIN c.areaCode a
        WHERE b.outstandingAmount > 0
          AND b.status IN ('PENDING', 'PARTIALLY PAID')
        GROUP BY c.userId, u.fullName, a.areaCode, a.areaName
        ORDER BY SUM(b.outstandingAmount) DESC
    """)
    List<DefaulterRowView> findDefaulters();

    @Query("""
        SELECT b
        FROM Bill b
          JOIN b.connection uc
        WHERE uc.customer.userId = :customerId
        ORDER BY b.periodEnd DESC
    """)
    List<Bill> findBillsByCustomerId(@Param("customerId") Integer customerId);
}
