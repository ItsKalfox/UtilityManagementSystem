package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.model.Permission;
import com.utilitymanagementsystem.repository.PermissionRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/permissions")
public class PermissionController {

    private final PermissionRepository permissionRepository;

    public PermissionController(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    @PreAuthorize("hasAuthority('MANAGE_ADMIN_ROLES')")
    @GetMapping
    public List<Map<String, Object>> getAllPermissions() {
        List<Permission> permissions = permissionRepository.findAll();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Permission p : permissions) {
            Map<String, Object> m = new HashMap<>();
            m.put("permission_id", p.getPermissionId());
            m.put("permission_name", p.getPermissionName());
            result.add(m);
        }
        return result;
    }
}
