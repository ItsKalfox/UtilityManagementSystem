package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.cashier.CashierConnectionDTO;
import com.utilitymanagementsystem.dto.cashier.CashierCustomerSearchDTO;
import com.utilitymanagementsystem.service.CashierPortalService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cashier/customers")
@PreAuthorize("hasRole('CASHIER')")
public class CashierCustomerController {
    private final CashierPortalService cashierPortalService;

    public CashierCustomerController(CashierPortalService cashierPortalService) {
        this.cashierPortalService = cashierPortalService;
    }

    @GetMapping("/search")
    public List<CashierCustomerSearchDTO> searchCustomers(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false, defaultValue = "") String customerType,
            @RequestParam(required = false, defaultValue = "") String connectionType,
            @RequestParam(required = false, defaultValue = "20") int limit
    ) {
        return cashierPortalService.searchCustomers(q, customerType, connectionType, limit);
    }
    @GetMapping("/{customerId}/connections")
    public List<CashierConnectionDTO> getCustomerConnections(@PathVariable Integer customerId) {
        return cashierPortalService.getCustomerConnections(customerId);
    }
}