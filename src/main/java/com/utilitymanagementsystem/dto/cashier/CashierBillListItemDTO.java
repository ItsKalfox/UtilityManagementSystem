package com.utilitymanagementsystem.dto.cashier;

import java.math.BigDecimal;
import java.time.Instant;

public record CashierBillListItemDTO(
        Integer billId,
        Integer connectionId,
        String utilityType,
        Integer customerId,
        String customerName,
        String customerType,
        Instant periodStart,
        Instant periodEnd,
        BigDecimal totalBillAmount,
        BigDecimal outstandingAmount,
        String status
) {}