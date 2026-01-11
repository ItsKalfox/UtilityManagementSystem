package com.utilitymanagementsystem.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UserCreateDTO(
        @NotBlank String fullName,
        @NotBlank String email,
        @NotBlank String nic,
        @NotNull
        @Size(min = 1)
        List<PhoneNumberDTO> phoneNumbers
) {}