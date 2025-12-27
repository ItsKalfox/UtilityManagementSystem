package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.admin.*;
import com.utilitymanagementsystem.dto.fieldofficer.*;
import com.utilitymanagementsystem.service.AdminService;
import com.utilitymanagementsystem.service.FieldOfficerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admins")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PreAuthorize("hasAuthority('READ_ADMIN')")
    @GetMapping
    public Page<AdminListDTO> listAdmin(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer roleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "userId") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        return adminService.getAdmin(
                search, status, roleId,
                page, size,
                sortBy, direction
        );
    }

    @PreAuthorize("hasAuthority('READ_ADMIN')")
    @GetMapping("/{id}")
    public AdminDetailDTO getAdmin(@PathVariable Integer id) {
        return adminService.getAdminDetails(id);
    }

    @GetMapping("check-nic/{nic}")
    public AdminNICCheckDTO checkAdmin(@PathVariable String nic) {
        return adminService.checkAdmin(nic);
    }

    @PreAuthorize("hasAuthority('UPDATE_ADMIN')")
    @PatchMapping("/{id}")
    public AdminDetailDTO updateAdmin(
            @PathVariable Integer id,
            @Valid @RequestBody AdminUpdateDTO request
    ) {
        return adminService.updateAdmin(id, request);
    }

    @PreAuthorize("hasAuthority('CREATE_ADMIN')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminDetailDTO createAdmin(@Valid @RequestBody AdminCreateDTO dto) {
        return adminService.createAdmin(dto);
    }

    @PreAuthorize("hasAuthority('CREATE_ADMIN')")
    @PostMapping("/full")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminDetailDTO createFullAdmin(@Valid @RequestBody AdminCreateFullDTO dto) {
        return adminService.createFullAdmin(dto);
    }

    @PreAuthorize("hasAuthority('DELETE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Integer id) {
        adminService.deleteAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('UPDATE_ADMIN')")
    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetAdminPassword(@PathVariable Integer id) {
        adminService.resetAdminPassword(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    @PreAuthorize("hasAuthority('UPDATE_ADMIN')")
    @PostMapping("/{id}/activate")
    public ResponseEntity<Void> activateAdmin(@PathVariable Integer id) {
        adminService.activateAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('UPDATE_ADMIN')")
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateAdmin(@PathVariable Integer id) {
        adminService.deactivateAdmin(id);
        return ResponseEntity.noContent().build();
    }
}
