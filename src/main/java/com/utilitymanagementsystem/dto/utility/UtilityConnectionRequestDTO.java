package com.utilitymanagementsystem.dto.utility;

import java.time.Instant;

public record UtilityConnectionRequestDTO(
        Integer customer_id,
        Integer tariff_id,
        String meter_serial_number,
        String utility_type,
        Instant install_date,
        String status
) {}
