package com.utilitymanagementsystem.dto;

import jakarta.validation.constraints.NotBlank;

public record ManagerCreateDTO(
        Integer managerId,
        @NotBlank String department
) {}
