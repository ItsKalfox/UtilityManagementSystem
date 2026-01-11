package com.utilitymanagementsystem.dto.manager;

import jakarta.validation.constraints.NotBlank;

public record ManagerCreateDTO(
        Integer managerId,
        @NotBlank String department
) {}