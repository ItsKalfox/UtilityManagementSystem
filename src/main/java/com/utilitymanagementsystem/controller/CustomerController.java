package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.CustomerDetailDTO;
import com.utilitymanagementsystem.service.CustomerService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/{id}")
    public CustomerDetailDTO getCustomer(@PathVariable Integer id) {
        return customerService.getCustomerDetails(id);
    }
}