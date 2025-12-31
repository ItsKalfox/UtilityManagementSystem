package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.cashier.CashierBillDTO;
import com.utilitymanagementsystem.service.CashierPortalService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cashier/connections")
@PreAuthorize("hasRole('CASHIER')")
public class CashierBillController {

    private final CashierPortalService cashierPortalService;

    public CashierBillController(CashierPortalService cashierPortalService) {
        this.cashierPortalService = cashierPortalService;
    }

    @GetMapping("/{connectionId}/current-bill")
    public CashierBillDTO getCurrentBill(@PathVariable Integer connectionId) {
        return cashierPortalService.getCurrentBillByConnection(connectionId);
    }
}
