package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.area.AreaListDTO;
import com.utilitymanagementsystem.dto.customer.*;
import com.utilitymanagementsystem.service.AreaService;
import com.utilitymanagementsystem.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/areas")
public class AreaController {

    private final AreaService areaService;

    public AreaController(AreaService areaService) {
        this.areaService = areaService;
    }

    @PreAuthorize("hasAuthority('UPDATE_CUSTOMER') or hasAuthority('CREATE_CUSTOMER')")
    @GetMapping
    public ResponseEntity<List<AreaListDTO>> getAllAreas() {
        return ResponseEntity.ok(areaService.getAllAreas());
    }
}
