package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByBill_BillIdOrderByPaymentDateDesc(Integer billId);
}
