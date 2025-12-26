package com.utilitymanagementsystem.dto.admin;

import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;

import java.util.List;

public record AdminUpdateDTO(
        String fullName,
        String email,
        String nic,
//        String status,
//        String password,
        Integer roleId,
        List<PhoneNumberDTO> phoneNumbers
) {}
