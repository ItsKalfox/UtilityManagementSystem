package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.fieldofficer.*;
import com.utilitymanagementsystem.service.FieldOfficerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/field-officers")
public class FieldOfficerController {
    private final FieldOfficerService fieldOfficerService;

    public FieldOfficerController(FieldOfficerService fieldOfficerService) {
        this.fieldOfficerService = fieldOfficerService;
    }

    @PreAuthorize("hasAuthority('READ_FIELD_OFFICER')")
    @GetMapping
    public Page<FieldOfficerListDTO> listFieldOfficers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "userId") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        return fieldOfficerService.getFieldOfficers(
                search, status,
                page, size,
                sortBy, direction
        );
    }

    @PreAuthorize("hasAuthority('READ_FIELD_OFFICER')")
    @GetMapping("/{id}")
    public FieldOfficerDetailDTO getFieldOfficer(@PathVariable Integer id) {
        return fieldOfficerService.getFieldOfficerDetails(id);
    }

    @GetMapping("check-nic/{nic}")
    public FieldOfficerNICCheckDTO checkFieldOfficer(@PathVariable String nic) {
        return fieldOfficerService.checkFieldOfficer(nic);
    }

    @PreAuthorize("hasAuthority('UPDATE_FIELD_OFFICER')")
    @PatchMapping("/{id}")
    public FieldOfficerDetailDTO updateFieldOfficer(
            @PathVariable Integer id,
            @Valid @RequestBody FieldOfficerUpdateDTO request
    ) {
        return fieldOfficerService.updateFieldOfficer(id, request);
    }

    @PreAuthorize("hasAuthority('CREATE_FIELD_OFFICER')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FieldOfficerDetailDTO createFieldOfficer(@Valid @RequestBody FieldOfficerCreateDTO dto) {
        return fieldOfficerService.createFieldOfficer(dto);
    }

    @PreAuthorize("hasAuthority('CREATE_FIELD_OFFICER')")
    @PostMapping("/full")
    @ResponseStatus(HttpStatus.CREATED)
    public FieldOfficerDetailDTO createFullFieldOfficer(@Valid @RequestBody FieldOfficerCreateFullDTO dto) {
        return fieldOfficerService.createFullFieldOfficer(dto);
    }

    @PreAuthorize("hasAuthority('DELETE_FIELD_OFFICER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFieldOfficer(@PathVariable Integer id) {
        fieldOfficerService.deleteFieldOfficer(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('UPDATE_FIELD_OFFICER')")
    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetFieldOfficerPassword(@PathVariable Integer id) {
        fieldOfficerService.resetFieldOfficerPassword(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    @PreAuthorize("hasAuthority('UPDATE_FIELD_OFFICER')")
    @PostMapping("/{id}/activate")
    public ResponseEntity<Void> activateFieldOfficer(@PathVariable Integer id) {
        fieldOfficerService.activateFieldOfficer(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('UPDATE_FIELD_OFFICER')")
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateFieldOfficer(@PathVariable Integer id) {
        fieldOfficerService.deactivateFieldOfficer(id);
        return ResponseEntity.noContent().build();
    }
}
