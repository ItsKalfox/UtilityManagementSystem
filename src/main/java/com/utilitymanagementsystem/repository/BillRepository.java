package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


import java.util.Optional;

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
    Optional<Bill> findFirstByConnection_ConnectionIdOrderByPeriodEndDesc(Integer connectionId);
    List<Bill> findByConnection_ConnectionIdOrderByPeriodEndDesc(Integer connectionId, Pageable pageable);

    List<Bill> findByConnection_ConnectionIdAndStatusNotOrderByPeriodEndDesc(Integer connectionId, String status, Pageable pageable);


    Optional<Bill> findFirstByConnection_ConnectionIdAndStatusNotOrderByPeriodEndDesc(Integer connectionId, String status);
    List<Bill> findByConnection_ConnectionIdAndStatusOrderByPeriodEndDesc(
            Integer connectionId,
            String status,
            Pageable pageable
    );
    List<Bill> findByConnection_ConnectionIdAndConnection_UtilityTypeOrderByPeriodEndDesc(
            Integer connectionId,
            String utilityType,
            Pageable pageable
    );

    @Query("""
SELECT b
FROM Bill b
JOIN FETCH b.connection c
JOIN FETCH c.customer cust
JOIN FETCH cust.user u
WHERE (:status IS NULL OR b.status = :status)
  AND (:utilityType IS NULL OR c.utilityType = :utilityType)
  AND (:customerType IS NULL OR cust.customerType = :customerType)
ORDER BY b.periodEnd DESC
""")
    List<Bill> cashierGetAllBills(
            @Param("status") String status,
            @Param("utilityType") String utilityType,
            @Param("customerType") String customerType,
            Pageable pageable
    );

}
