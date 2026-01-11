package com.utilitymanagementsystem.dto.customer;

import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;

import java.util.List;

public record CustomerUpdateDTO(
        String fullName,
        String email,
        String nic,
        String areaCode,
        String addressLine1,
        String addressLine2,
        String addressCity,
        String addressPostalCode,
        String businessType,
        String businessRegiNum,
        String taxId,
        Integer householdSize,
        String governmentId,
        String department,
        List<PhoneNumberDTO> phoneNumbers
) {}