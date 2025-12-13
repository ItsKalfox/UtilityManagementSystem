package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.CustomerDetailView;
import com.utilitymanagementsystem.dto.CustomerListDTO;
import com.utilitymanagementsystem.dto.CustomerUpdateDTO;
import com.utilitymanagementsystem.service.CustomerService;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // 🔹 LIST customers (pagination + search + filter + sort)
    @PreAuthorize("hasAuthority('READ_CUSTOMER')")
    @GetMapping
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

    // 🔹 GET single customer details
    @PreAuthorize("hasAuthority('READ_CUSTOMER')")
    @GetMapping("/{id}")
    public CustomerDetailView getCustomer(@PathVariable Integer id) {
        return customerService.getCustomerDetails(id);
    }

    @PreAuthorize("hasAuthority('UPDATE_CUSTOMER')")
    @PatchMapping("/{id}")
    public CustomerDetailView updateCustomer(
            @PathVariable Integer id,
            @RequestBody CustomerUpdateDTO request
    ) {
        return customerService.updateCustomer(id, request);
    }

}
