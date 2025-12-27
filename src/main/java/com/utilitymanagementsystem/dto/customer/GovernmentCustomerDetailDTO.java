package com.utilitymanagementsystem.dto.customer;

import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;

import java.time.Instant;
import java.util.List;

public record GovernmentCustomerDetailDTO(
        Integer userId,
        String fullName,
        String email,
        String nic,
        String status,
        Instant createdAt,
        Instant updatedAt,
        String areaCode,
        String addressLine1,
        String addressLine2,
        String addressCity,
        String addressPostalCode,
        String customerType,
        String governmentId,
        String department,
        List<PhoneNumberDTO> phoneNumbers
) implements CustomerDetailView {}
