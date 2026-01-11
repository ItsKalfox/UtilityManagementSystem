package com.utilitymanagementsystem.dto.customer;

public record CustomerNICCheckDTO(
        boolean exists,
        boolean hasCustomerProfile,
        Integer userId
) { }