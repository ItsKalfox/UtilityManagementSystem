package com.utilitymanagementsystem.dto.cashier;

import jakarta.validation.constraints.NotBlank;

public record CashierCreateDTO(
        Integer cashierId,
        @NotBlank String branchName
) {}