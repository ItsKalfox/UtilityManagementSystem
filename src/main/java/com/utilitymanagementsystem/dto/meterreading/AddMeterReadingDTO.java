package com.utilitymanagementsystem.dto.meterreading;

import jakarta.validation.constraints.NotBlank;


public record AddMeterReadingDTO (
        @NotBlank Integer field_officer_id,
        @NotBlank Integer connection_id,
        @NotBlank Integer reading_value,
        @NotBlank Integer consumption,
        @NotBlank String billing_period_start,
        @NotBlank String billing_period_end

){
}
