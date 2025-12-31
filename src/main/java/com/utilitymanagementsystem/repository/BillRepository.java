package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Integer> {

    // ✅ Latest bill (most recent periodEnd) for a connection
    Optional<Bill> findFirstByConnection_ConnectionIdOrderByPeriodEndDesc(Integer connectionId);

    // ✅ If you want “current unpaid/partially paid” instead (optional later)
    Optional<Bill> findFirstByConnection_ConnectionIdAndStatusNotOrderByPeriodEndDesc(Integer connectionId, String status);
}
