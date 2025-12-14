package com.utilitymanagementsystem.dto;

import java.util.List;

public record CustomerCreateDTO(
        Integer customerId,
        String areaCode,

        String addressLine1,
        String addressLine2,
        String addressCity,
        String addressPostalCode,

        String customerType,

        // Household
        Integer householdSize,

        // Business
        String businessType,
        String businessRegiNum,
        String taxId,

        // Government
        String governmentId,
        String department
) {}
