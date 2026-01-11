package com.utilitymanagementsystem.dto.user;

import java.util.List;

public record UserUpdateDTO(
        String fullName,
        String email,
        String nic,
        List<PhoneNumberDTO> phoneNumbers
) {}