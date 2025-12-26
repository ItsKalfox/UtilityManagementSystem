package com.utilitymanagementsystem.dto.admin;

import com.utilitymanagementsystem.dto.customer.CustomerDetailView;
import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;

import java.time.Instant;
import java.util.List;

public record AdminDetailDTO(
        Integer userId,
        String fullName,
        String email,
        String nic,
        String status,
//        boolean systemAccess,
        Instant createdAt,
        Instant updatedAt,
        String roleName,
        List<PhoneNumberDTO> phoneNumbers
) implements CustomerDetailView {}

