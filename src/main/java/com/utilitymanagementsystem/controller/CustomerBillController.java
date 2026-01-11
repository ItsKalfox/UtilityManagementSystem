package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.customer.CustomerBillDTO;
import com.utilitymanagementsystem.service.CustomerBillService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customer/bills")
public class CustomerBillController {

    private final CustomerBillService customerBillService;

    public CustomerBillController(CustomerBillService customerBillService) {
        this.customerBillService = customerBillService;
    }

    @GetMapping
    public List<CustomerBillDTO> getCustomerBills(
            @RequestParam String email
    ) {
        return customerBillService.getBillsByCustomerEmail(email);
    }
}
