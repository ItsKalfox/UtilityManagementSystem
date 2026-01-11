package com.utilitymanagementsystem.dto.cashier;

public record CashierConnectionDTO(
        Integer connectionId,
        String utilityType,
        String meterSerialNumber,
        String status
) {}