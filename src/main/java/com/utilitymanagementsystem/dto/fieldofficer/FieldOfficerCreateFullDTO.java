package com.utilitymanagementsystem.dto.fieldofficer;

import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record FieldOfficerCreateFullDTO(
        @NotBlank String fullName,
        @NotBlank String email,
        @NotBlank String nic,
        @NotBlank String vehicleNo,
        @NotBlank String areaCode,
        @NotNull
        @Size(min = 1)
        List<PhoneNumberDTO> phoneNumbers
) {}