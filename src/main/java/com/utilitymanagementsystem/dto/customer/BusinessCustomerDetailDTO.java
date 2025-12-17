package com.utilitymanagementsystem.dto.customer;

import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;

import java.time.Instant;
import java.util.List;

public record BusinessCustomerDetailDTO(
        Integer userId,
        String fullName,
        String email,
        String nic,
        String status,
        boolean systemAccess,
        Instant createdAt,
        Instant updatedAt,
        String areaCode,
        String addressLine1,
        String addressLine2,
        String addressCity,
        String addressPostalCode,
        String customerType,
        String businessType,
        String businessRegiNum,
        String taxId,
        List<PhoneNumberDTO> phoneNumbers
) implements CustomerDetailView {}

