package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BillRepository extends JpaRepository<Bill, Integer> {

    @Query(value = """
        SELECT b.*
        FROM bill b
        JOIN utility_connection uc ON b.connection_id = uc.connection_id
        JOIN customer c ON uc.customer_id = c.user_id
        JOIN users u ON c.user_id = u.user_id
        WHERE u.email = :email
        ORDER BY b.period_end DESC
    """, nativeQuery = true)
    List<Bill> findBillsByCustomerEmail(@Param("email") String email);
}

