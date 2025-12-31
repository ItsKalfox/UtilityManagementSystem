package com.utilitymanagementsystem.dto.cashier;

import java.math.BigDecimal;

public record CashierPayBillRequestDTO(
        Integer billId,
        String method,          // "CASH", "CARD", "BANK TRANSFER"
        BigDecimal amount,
        CashDTO cash,
        CardDTO card,
        BankTransferDTO bankTransfer
) {
    public record CashDTO(BigDecimal amountGiven) {}
    public record CardDTO(String platformName, String cardType, String approvalCode) {} // CREDIT/DEBIT
    public record BankTransferDTO(String bankName, String accountNumber, String transactionNum) {}
}
