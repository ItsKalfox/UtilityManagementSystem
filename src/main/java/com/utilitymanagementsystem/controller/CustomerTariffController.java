package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.service.CustomerTariffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
public class CustomerTariffController {
    private final CustomerTariffService customerTariffService;

    @Autowired
    public CustomerTariffController(CustomerTariffService customerTariffService) {
        this.customerTariffService = customerTariffService;
    }

    @GetMapping("/{customerId}/tariff-history")
    public ResponseEntity<?> getTariffHistory(@PathVariable int customerId) {
        return ResponseEntity.ok(
                customerTariffService.getTariffHistory(customerId)
        );
    }
}