package com.utilitymanagementsystem.dto.fieldofficer;

import jakarta.validation.constraints.NotBlank;

public record FieldOfficerCreateDTO(
        Integer fieldOfficerId,
        @NotBlank String vehicleNo,
        @NotBlank String areaCode
) {}