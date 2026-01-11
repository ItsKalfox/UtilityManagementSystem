package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.customer.CustomerNICCheckDTO;
import com.utilitymanagementsystem.dto.manager.*;
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

    @PreAuthorize("hasAuthority('READ_MANAGER')")
    @GetMapping("/{id}")
    public ManagerDetailDTO getManager(@PathVariable Integer id) {
        return managerService.getManagerDetails(id);
    }

    @GetMapping("check-nic/{nic}")
    public ManagerNICCheckDTO checkManager(@PathVariable String nic) {
        return managerService.checkManager(nic);
    }

    @PreAuthorize("hasAuthority('UPDATE_MANAGER')")
    @PatchMapping("/{id}")
    public ManagerDetailDTO updateManage(
            @PathVariable Integer id,
            @Valid @RequestBody ManagerUpdateDTO request
    ) {
        return managerService.updateManager(id, request);
    }

    @PreAuthorize("hasAuthority('CREATE_MANAGER')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ManagerDetailDTO createManager(@Valid @RequestBody ManagerCreateDTO dto) {
        return managerService.createManager(dto);
    }

    @PreAuthorize("hasAuthority('CREATE_MANAGER')")
    @PostMapping("/full")
    @ResponseStatus(HttpStatus.CREATED)
    public ManagerDetailDTO createFullManager(@Valid @RequestBody ManagerCreateFullDTO dto) {
        return managerService.createFullManager(dto);
    }

    @PreAuthorize("hasAuthority('DELETE_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteManager(@PathVariable Integer id) {
        managerService.deleteManager(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('UPDATE_MANAGER')")
    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetManagerPassword(@PathVariable Integer id) {
        managerService.resetManagerPassword(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('UPDATE_MANAGER')")
    @PostMapping("/{id}/activate")
    public ResponseEntity<Void> activateManager(@PathVariable Integer id) {
        managerService.activateManager(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('UPDATE_MANAGER')")
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateManager(@PathVariable Integer id) {
        managerService.deactivateManager(id);
        return ResponseEntity.noContent().build();
    }
}