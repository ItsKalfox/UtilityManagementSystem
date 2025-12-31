package com.utilitymanagementsystem.dto.cashier;

import java.math.BigDecimal;
import java.time.Instant;

public record CashierBillDTO(
        Integer billId,
        Integer connectionId,
        Instant periodStart,
        Instant periodEnd,
        BigDecimal totalBillAmount,
        BigDecimal outstandingAmount,
        String status
) {}
