package com.utilitymanagementsystem.dto;

import java.util.List;

public record CustomerUpdateDTO(
        String fullName,
        String email,
        String nic,
        String status,

        String addressLine1,
        String addressLine2,
        String addressCity,
        String addressPostalCode,

        // Business-only
        String businessType,
        String businessRegiNum,
        String taxId,

        // Household-only
        Integer householdSize,

        // Government-only
        String governmentId,
        String department,

        List<PhoneNumberDTO> phoneNumbers
) {}
