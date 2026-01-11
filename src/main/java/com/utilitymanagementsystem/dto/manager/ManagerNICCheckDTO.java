package com.utilitymanagementsystem.dto.manager;

public record ManagerNICCheckDTO(
        boolean exists,
        boolean hasManagerProfile,
        Integer userId
) { }