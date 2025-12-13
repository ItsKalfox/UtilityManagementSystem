package com.utilitymanagementsystem.dto;

import java.util.List;

public record BusinessCustomerDetailDTO(
        Integer userId,
        String fullName,
        String email,
        String nic,
        String status,
        String customerType,
        String addressLine1,
        String addressLine2,
        String addressCity,
        String addressPostalCode,
        String businessType,
        String businessRegiNum,
        String taxId,
        List<PhoneNumberDTO> phoneNumbers
) implements CustomerDetailView {}

