package com.utilitymanagementsystem.dto.admin;

import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AdminCreateFullDTO(
        @NotBlank String fullName,
        @NotBlank String email,
        @NotBlank String nic,
        @NotBlank Integer roleId,

        @NotNull
        @Size(min = 1)
        List<PhoneNumberDTO> phoneNumbers
) {}
