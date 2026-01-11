package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.cashier.CashierBillListItemDTO;
import com.utilitymanagementsystem.service.CashierPortalService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cashier/bills")
@PreAuthorize("hasRole('CASHIER')")
public class CashierBillsController {
    private final CashierPortalService cashierPortalService;

    public CashierBillsController(CashierPortalService cashierPortalService) {
        this.cashierPortalService = cashierPortalService;
    }

    @GetMapping
    public List<CashierBillListItemDTO> getAllBills(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String utilityType,
            @RequestParam(required = false) String customerType,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return cashierPortalService.getAllBills(status, utilityType, customerType, limit);
    }
}