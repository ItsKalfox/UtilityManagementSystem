package com.utilitymanagementsystem.dto.cashier;

public record CashierNICCheckDTO(
        boolean exists,
        boolean hasCashierProfile,
        Integer userId
) { }