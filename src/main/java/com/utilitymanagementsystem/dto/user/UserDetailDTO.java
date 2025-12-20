package com.utilitymanagementsystem.dto.user;

import java.time.Instant;
import java.util.List;

public record UserDetailDTO(
        Integer userId,
        String fullName,
        String email,
        String nic,
//        String status,
//        boolean systemAccess,
//        Instant createdAt,
//        Instant updatedAt,
        List<PhoneNumberDTO> phoneNumbers,
        List<String> profiles
) {}
