package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.lists.AreaListDTO;
import com.utilitymanagementsystem.dto.lists.RoleListDTO;
import com.utilitymanagementsystem.service.ListsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
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

    @PreAuthorize("hasAuthority('UPDATE_ADMIN') or hasAuthority('CREATE_ADMIN')")
    @GetMapping("/roles")
    public ResponseEntity<List<RoleListDTO>> getAllRoles() {
        return ResponseEntity.ok(listsService.getAllRoles());
    }
}
