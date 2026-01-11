package com.utilitymanagementsystem.dto.manager;

import com.utilitymanagementsystem.dto.customer.CustomerDetailView;
import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;

import java.time.Instant;
import java.util.List;

public record ManagerDetailDTO(
        Integer userId,
        String fullName,
        String email,
        String nic,
        String status,
        Instant createdAt,
        Instant updatedAt,
        String department,
        List<PhoneNumberDTO> phoneNumbers
) implements CustomerDetailView {}