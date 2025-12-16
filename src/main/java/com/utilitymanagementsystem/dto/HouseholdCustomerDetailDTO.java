package com.utilitymanagementsystem.dto;

import java.time.Instant;
import java.util.List;

public record HouseholdCustomerDetailDTO(
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
        Integer householdSize,
        List<PhoneNumberDTO> phoneNumbers
) implements CustomerDetailView {}

