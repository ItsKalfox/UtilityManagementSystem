package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.customer.CustomerListDTO;
import com.utilitymanagementsystem.service.CustomerService;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/meter-reading")
public class MeterReadingController {
    private final CustomerService customerService;
//    private final MeterReadingService meterReadingService;

    public MeterReadingController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // 🔹 LIST customers for field officer

    @GetMapping("customers")
    public Page<CustomerListDTO> listCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "userId") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        return customerService.getCustomers(
                search, type, status,
                page, size,
                sortBy, direction
        );
    }

}
