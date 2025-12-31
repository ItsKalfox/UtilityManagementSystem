package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.cashier.CashierPayBillRequestDTO;
import com.utilitymanagementsystem.dto.cashier.CashierPayBillResponseDTO;
import com.utilitymanagementsystem.service.CashierPaymentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cashier")
@PreAuthorize("hasRole('CASHIER')")
public class CashierPaymentController {

    private final CashierPaymentService cashierPaymentService;

    public CashierPaymentController(CashierPaymentService cashierPaymentService) {
        this.cashierPaymentService = cashierPaymentService;
    }

    @PostMapping("/payments")
    public CashierPayBillResponseDTO payBill(@RequestBody CashierPayBillRequestDTO req) {
        return cashierPaymentService.payBill(req);
    }
}
