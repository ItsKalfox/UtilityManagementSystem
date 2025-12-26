package com.utilitymanagementsystem.dto.admin;

public record AdminNICCheckDTO(
        boolean exists,
        boolean hasAdminProfile,
        Integer userId
) { }
