package com.utilitymanagementsystem.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record AdminCreateDTO(
        Integer adminId,
        @NotBlank Integer roleId
) {}
