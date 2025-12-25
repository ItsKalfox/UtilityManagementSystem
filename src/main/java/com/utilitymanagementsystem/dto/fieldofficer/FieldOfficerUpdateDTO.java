package com.utilitymanagementsystem.dto.fieldofficer;

import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;

import java.util.List;

public record FieldOfficerUpdateDTO(
        String fullName,
        String email,
        String nic,
//        String status,
//        String password,
        String areaCode,
        List<PhoneNumberDTO> phoneNumbers
) {}
