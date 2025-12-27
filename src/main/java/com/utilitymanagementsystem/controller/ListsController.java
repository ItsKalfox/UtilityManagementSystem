package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.admin.AdminListDTO;
import com.utilitymanagementsystem.dto.lists.AdminIdNameListDTO;
import com.utilitymanagementsystem.dto.lists.AreaListDTO;
import com.utilitymanagementsystem.dto.lists.RoleListDTO;
import com.utilitymanagementsystem.service.ListsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/list")
public class ListsController {

    private final ListsService listsService;

    public ListsController(ListsService listsService) {
        this.listsService = listsService;
    }

    @PreAuthorize("hasAuthority('UPDATE_CUSTOMER') or hasAuthority('CREATE_CUSTOMER') or hasAuthority('UPDATE_FIELD_OFFICER') or hasAuthority('CREATE_FIELD_OFFICER')")
    @GetMapping("/areas")
    public ResponseEntity<List<AreaListDTO>> getAllAreas() {
        return ResponseEntity.ok(listsService.getAllAreas());
    }

    @PreAuthorize("hasAuthority('READ_ADMIN')")
    @GetMapping("/roles")
    public ResponseEntity<List<RoleListDTO>> getAllRoles() {
        return ResponseEntity.ok(listsService.getAllRoles());
    }

    @PreAuthorize("hasAuthority('READ_ACTION_LOGS')")
    @GetMapping("/admins")
    public ResponseEntity<List<AdminIdNameListDTO>> getAllAdmins() { return ResponseEntity.ok(listsService.getAllAdmins()); }
}
