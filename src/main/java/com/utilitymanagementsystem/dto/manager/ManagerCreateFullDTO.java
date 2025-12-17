package com.utilitymanagementsystem.dto.manager;

import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ManagerCreateFullDTO(
        @NotBlank String fullName,
        @NotBlank String email,
        @NotBlank String nic,
        @NotNull String password,
        @NotBlank String department,

        @NotNull
        @Size(min = 1)
        List<PhoneNumberDTO> phoneNumbers
) {}
