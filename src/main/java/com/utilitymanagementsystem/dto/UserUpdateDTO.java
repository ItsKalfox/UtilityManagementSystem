package com.utilitymanagementsystem.dto;

import java.util.List;

public record UserUpdateDTO(
        String fullName,
        String email,
        String nic,
        String status,
        String password,
        List<PhoneNumberDTO> phoneNumbers
) {}
