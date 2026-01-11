package com.utilitymanagementsystem.dto.customer;

import jakarta.validation.constraints.NotBlank;

public record CustomerCreateDTO(
        Integer customerId,
        String areaCode,
        @NotBlank String addressLine1,
        @NotBlank String addressLine2,
        @NotBlank String addressCity,
        @NotBlank String addressPostalCode,
        @NotBlank String customerType,
        Integer householdSize,
        String businessType,
        String businessRegiNum,
        String taxId,
        String governmentId,
        String department
) {}