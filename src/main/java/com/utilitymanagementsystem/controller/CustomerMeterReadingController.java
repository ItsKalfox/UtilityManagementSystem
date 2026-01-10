package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.service.CustomerMeterReadingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
public class CustomerMeterReadingController {

    private final CustomerMeterReadingService service;

    public CustomerMeterReadingController(
            CustomerMeterReadingService service) {
        this.service = service;
    }

    @GetMapping("/{customerId}/meter-readings")
    public List<Object[]> getMeterReadings(
            @PathVariable int customerId) {

        return service.getMeterReadings(customerId);
    }
}
