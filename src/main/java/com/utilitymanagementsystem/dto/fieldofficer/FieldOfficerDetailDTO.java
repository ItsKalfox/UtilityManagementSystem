package com.utilitymanagementsystem.dto.fieldofficer;

import com.utilitymanagementsystem.dto.customer.CustomerDetailView;
import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;

import java.time.Instant;
import java.util.List;

public record FieldOfficerDetailDTO(
        Integer userId,
        String fullName,
        String email,
        String nic,
        String status,
//        boolean systemAccess,
        Instant createdAt,
        Instant updatedAt,
        String areaCode,
        List<PhoneNumberDTO> phoneNumbers
) implements CustomerDetailView {}

