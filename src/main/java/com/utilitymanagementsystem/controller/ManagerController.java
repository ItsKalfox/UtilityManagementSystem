package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.*;
import com.utilitymanagementsystem.service.CustomerService;
import com.utilitymanagementsystem.service.ManagerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/managers")
public class ManagerController {

    private final ManagerService managerService;

    public ManagerController(ManagerService managerService) {
        this.managerService = managerService;
    }

    // 🔹 LIST customers (pagination + search + filter + sort)
    @PreAuthorize("hasAuthority('READ_MANAGER')")
    @GetMapping
    public Page<ManagerListDTO> listManagers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "userId") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        return managerService.getManagers(
                search, status,
                page, size,
                sortBy, direction
        );
    }

//    @PreAuthorize("hasAuthority('READ_CUSTOMER')")
//    @GetMapping("/{id}")
//    public CustomerDetailView getCustomer(@PathVariable Integer id) {
//        return customerService.getCustomerDetails(id);
//    }
//
//    @PreAuthorize("hasAuthority('UPDATE_CUSTOMER')")
//    @PatchMapping("/{id}")
//    public CustomerDetailView updateCustomer(
//            @PathVariable Integer id,
//            @Valid @RequestBody CustomerUpdateDTO request
//    ) {
//        return customerService.updateCustomer(id, request);
//    }
//
//    @PreAuthorize("hasAuthority('CREATE_CUSTOMER')")
//    @PostMapping
//    @ResponseStatus(HttpStatus.CREATED)
//    public CustomerDetailView createCustomer(@Valid @RequestBody CustomerCreateDTO dto) {
//        return customerService.createCustomer(dto);
//    }
//
//    @PreAuthorize("hasAuthority('CREATE_CUSTOMER')")
//    @PostMapping("/full")
//    @ResponseStatus(HttpStatus.CREATED)
//    public CustomerDetailView createFullCustomer(@Valid @RequestBody CustomerCreateFullDTO dto) {
//        return customerService.createFullCustomer(dto);
//    }
//
//    // 🔹 DELETE customer (cascades to Household / Business / GovernmentOrganization)
//    @PreAuthorize("hasAuthority('DELETE_CUSTOMER')")
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteCustomer(@PathVariable Integer id) {
//        customerService.deleteCustomer(id);
//        return ResponseEntity.noContent().build(); // 204 No Content
//    }
}
