package com.utilitymanagementsystem.dto.manager;

import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;

import java.util.List;

public record ManagerUpdateDTO(
        String fullName,
        String email,
        String nic,
        String department,
        List<PhoneNumberDTO> phoneNumbers
) {}
