package com.utilitymanagementsystem.dto.user;

import java.util.List;

public record UserUpdateDTO(
        String fullName,
        String email,
        String nic,
//        String status,
//        String password,
        List<PhoneNumberDTO> phoneNumbers
) {}
