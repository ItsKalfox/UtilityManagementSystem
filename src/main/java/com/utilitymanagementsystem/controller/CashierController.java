package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.cashier.*;
import com.utilitymanagementsystem.dto.manager.*;
import com.utilitymanagementsystem.service.CashierService;
import com.utilitymanagementsystem.service.ManagerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cashiers")
public class CashierController {

    private final CashierService cashierService;

    public CashierController(CashierService cashierService) {
        this.cashierService = cashierService;
    }

    @PreAuthorize("hasAuthority('READ_CASHIER')")
    @GetMapping
    public Page<CashierListDTO> listCashiers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "userId") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        return cashierService.getCashiers(
                search, status,
                page, size,
                sortBy, direction
        );
    }

    @PreAuthorize("hasAuthority('READ_CASHIER')")
    @GetMapping("/{id}")
    public CashierDetailDTO getCashier(@PathVariable Integer id) {
        return cashierService.getCashierDetails(id);
    }

    @GetMapping("check-nic/{nic}")
    public CashierNICCheckDTO checkCashier(@PathVariable String nic) {
        return cashierService.checkCashier(nic);
    }

    @PreAuthorize("hasAuthority('UPDATE_CASHIER')")
    @PatchMapping("/{id}")
    public CashierDetailDTO updateCashier(
            @PathVariable Integer id,
            @Valid @RequestBody CashierUpdateDTO request
    ) {
        return cashierService.updateCashier(id, request);
    }

    @PreAuthorize("hasAuthority('CREATE_CASHIER')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CashierDetailDTO createCashier(@Valid @RequestBody CashierCreateDTO dto) {
        return cashierService.createCashier(dto);
    }

    @PreAuthorize("hasAuthority('CREATE_CASHIER')")
    @PostMapping("/full")
    @ResponseStatus(HttpStatus.CREATED)
    public CashierDetailDTO createFullCashier(@Valid @RequestBody CashierCreateFullDTO dto) {
        return cashierService.createFullCashier(dto);
    }

    @PreAuthorize("hasAuthority('DELETE_CASHIER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCashier(@PathVariable Integer id) {
        cashierService.deleteCashier(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('UPDATE_CASHIER')")
    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetCashierPassword(@PathVariable Integer id) {
        cashierService.resetCashierPassword(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    @PreAuthorize("hasAuthority('UPDATE_CASHIER')")
    @PostMapping("/{id}/activate")
    public ResponseEntity<Void> activateCashier(@PathVariable Integer id) {
        cashierService.activateCashier(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('UPDATE_CASHIER')")
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateCashier(@PathVariable Integer id) {
        cashierService.deactivateCashier(id);
        return ResponseEntity.noContent().build();
    }
}
