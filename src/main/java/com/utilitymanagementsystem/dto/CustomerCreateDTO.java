package com.utilitymanagementsystem.dto;

import jakarta.validation.constraints.NotBlank;

public record CustomerCreateDTO(
        Integer customerId,
        String areaCode,

        @NotBlank String addressLine1,
        @NotBlank String addressLine2,
        @NotBlank String addressCity,
        @NotBlank String addressPostalCode,

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
