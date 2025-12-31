package com.utilitymanagementsystem.dto.cashier;

public record CashierCustomerSearchDTO(
        Integer customerId,
        String fullName,
        String nic,
        String email,
        String phoneNumber,
        String customerType,
        String status,
        String areaCode,
        String addressCity
) {}
