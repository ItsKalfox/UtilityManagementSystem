package com.utilitymanagementsystem.dto;

import java.util.List;

public record HouseholdCustomerDetailDTO(
        Integer userId,
        String fullName,
        String email,
        String nic,
        String status,
        String areaCode,
        String addressLine1,
        String addressLine2,
        String addressCity,
        String addressPostalCode,
        String customerType,
        Integer householdSize,
        List<PhoneNumberDTO> phoneNumbers
) implements CustomerDetailView {}

