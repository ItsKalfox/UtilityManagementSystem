package com.utilitymanagementsystem.dto.customer;

import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CustomerCreateFullDTO(
        @NotBlank String fullName,
        @NotBlank String email,
        @NotBlank String nic,
        @NotBlank String areaCode,

        @NotBlank String addressLine1,
        @NotBlank String addressLine2,
        @NotBlank String addressCity,
        @NotBlank String addressPostalCode,

        @NotNull String customerType,

        // Household
        Integer householdSize,

        // Business
        String businessType,
        String businessRegiNum,
        String taxId,

        // Government
        String governmentId,
        String department,

        @NotNull
        @Size(min = 1)
        List<PhoneNumberDTO> phoneNumbers
) {}
