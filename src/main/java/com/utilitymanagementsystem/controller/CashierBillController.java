package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.cashier.CashierBillDTO;
import com.utilitymanagementsystem.service.CashierPortalService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.utilitymanagementsystem.dto.cashier.CashierBillHistoryDTO;
import java.util.List;

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
    @GetMapping("/{connectionId}/bills")
    public List<CashierBillHistoryDTO> getBillHistory(
            @PathVariable Integer connectionId,
            @RequestParam(defaultValue = "true") boolean includePaid,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String utilityType,
            @RequestParam(defaultValue = "12") int limit
    ) {
        return cashierPortalService.getBillHistoryByConnection(
                connectionId, includePaid, status, utilityType, limit
        );
    }
}