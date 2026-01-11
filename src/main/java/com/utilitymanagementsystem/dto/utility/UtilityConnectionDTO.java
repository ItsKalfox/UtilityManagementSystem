package com.utilitymanagementsystem.dto.utility;

import java.time.Instant;

public record UtilityConnectionDTO(
        Integer connection_id,
        Integer customer_id,
        Integer tariff_id,
        String meter_serial_number,
        String utility_type,
        Instant install_date,
        String status
) {}
