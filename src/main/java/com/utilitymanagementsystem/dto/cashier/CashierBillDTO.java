package com.utilitymanagementsystem.dto.cashier;

import java.math.BigDecimal;
import java.time.Instant;

public record CashierBillDTO(
        Integer billId,
        Integer connectionId,
        Integer customerId,
        String utilityType,
        String customerName,
        Instant periodStart,
        Instant periodEnd,
        BigDecimal totalBillAmount,
        BigDecimal outstandingAmount,
        String status
) {}