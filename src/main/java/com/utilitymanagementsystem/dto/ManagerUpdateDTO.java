package com.utilitymanagementsystem.dto;

import java.util.List;

public record ManagerUpdateDTO(
        String fullName,
        String email,
        String nic,
        String status,
        String password,
        String department,
        List<PhoneNumberDTO> phoneNumbers
) {}
