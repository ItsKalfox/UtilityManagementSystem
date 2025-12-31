package com.utilitymanagementsystem.dto.cashier;

import java.math.BigDecimal;

public record CashierPayBillResponseDTO(
        Integer paymentId,
        Integer billId,
        BigDecimal paidAmount,
        BigDecimal outstandingAmountAfter,
        String billStatusAfter
) {}
