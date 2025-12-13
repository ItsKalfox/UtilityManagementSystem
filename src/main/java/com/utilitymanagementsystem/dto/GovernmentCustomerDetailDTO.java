package com.utilitymanagementsystem.dto;

import java.util.List;

public record GovernmentCustomerDetailDTO(
        Integer userId,
        String fullName,
        String email,
        String nic,
        String status,
        String customerType,
        String addressLine1,
        String addressLine2,
        String addressCity,
        String addressPostalCode,
        String governmentId,
        String department,
        List<PhoneNumberDTO> phoneNumbers
) implements CustomerDetailView {}
