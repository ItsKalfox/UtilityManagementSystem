package com.utilitymanagementsystem.dto;

import java.time.Instant;
import java.util.List;

public record ManagerDetailDTO(
        Integer userId,
        String fullName,
        String email,
        String nic,
        String status,
        boolean systemAccess,
        Instant createdAt,
        Instant updatedAt,
        String department,
        List<PhoneNumberDTO> phoneNumbers
) implements CustomerDetailView {}

