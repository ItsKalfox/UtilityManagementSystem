package com.utilitymanagementsystem.dto.cashier;

import com.utilitymanagementsystem.dto.customer.CustomerDetailView;
import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;

import java.time.Instant;
import java.util.List;

public record CashierDetailDTO(
        Integer userId,
        String fullName,
        String email,
        String nic,
        String status,
        Instant createdAt,
        Instant updatedAt,
        String branchName,
        List<PhoneNumberDTO> phoneNumbers
) implements CustomerDetailView {}