package com.utilitymanagementsystem.dto.fieldofficer;

public record FieldOfficerNICCheckDTO(
        boolean exists,
        boolean hasFieldOfficerProfile,
        Integer userId
) { }