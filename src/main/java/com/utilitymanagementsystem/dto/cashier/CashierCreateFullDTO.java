package com.utilitymanagementsystem.dto.cashier;

import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CashierCreateFullDTO(
        @NotBlank String fullName,
        @NotBlank String email,
        @NotBlank String nic,
        @NotBlank String branchName,
        @NotNull
        @Size(min = 1)
        List<PhoneNumberDTO> phoneNumbers
) {}
