package com.utilitymanagementsystem.dto.cashier;

import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;

import java.util.List;

public record CashierUpdateDTO(
        String fullName,
        String email,
        String nic,
        String branchName,
        List<PhoneNumberDTO> phoneNumbers
) {}
