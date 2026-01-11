package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.role.RoleRequestDTO;
import com.utilitymanagementsystem.model.Permission;
import com.utilitymanagementsystem.model.Role;
import com.utilitymanagementsystem.model.RolePermission;
import com.utilitymanagementsystem.repository.PermissionRepository;
import com.utilitymanagementsystem.repository.RolePermissionRepository;
import com.utilitymanagementsystem.repository.RoleRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/roles")
public class RoleController {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    public RoleController(RoleRepository roleRepository,
                          PermissionRepository permissionRepository,
                          RolePermissionRepository rolePermissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    @PreAuthorize("hasAuthority('MANAGE_ADMIN_ROLES')")
    @GetMapping
    public List<Map<String, Object>> getAllRoles() {
        List<Role> roles = roleRepository.findAll();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Role r : roles) {
            Map<String, Object> m = new HashMap<>();
            m.put("role_id", r.getRoleId());
            m.put("role_name", r.getRoleName());
            result.add(m);
        }
        return result;
    }

    @PreAuthorize("hasAuthority('MANAGE_ADMIN_ROLES')")
    @GetMapping("/{id}")
    public Map<String, Object> getRole(@PathVariable Integer id) {
        Role role = roleRepository.findById(id).orElseThrow();
        List<Integer> permissionIds = permissionRepository.findPermissionIdsByRoleId(id);

        Map<String, Object> res = new HashMap<>();
        res.put("role_id", role.getRoleId());
        res.put("role_name", role.getRoleName());
        res.put("permission_ids", permissionIds);
        return res;
    }

    @Transactional
    @PreAuthorize("hasAuthority('MANAGE_ADMIN_ROLES')")
    @PostMapping
    public Map<String, Object> createRole(@RequestBody RoleRequestDTO dto) {
        Role role = new Role();
        role.setRoleName(dto.getRoleName());
        Role saved = roleRepository.save(role);

        if (dto.getPermissionIds() != null) {
            for (Integer pid : dto.getPermissionIds()) {
                Permission p = permissionRepository.findById(pid).orElseThrow();
                RolePermission rp = new RolePermission();
                rp.setRole(saved);
                rp.setPermission(p);
                rolePermissionRepository.save(rp);
            }
        }

        Map<String, Object> res = new HashMap<>();
        res.put("role_id", saved.getRoleId());
        res.put("role_name", saved.getRoleName());
        res.put("permission_ids", dto.getPermissionIds() == null ? List.of() : dto.getPermissionIds());
        return res;
    }

    @Transactional
    @PreAuthorize("hasAuthority('MANAGE_ADMIN_ROLES')")
    @PutMapping("/{id}")
    public Map<String, Object> updateRole(@PathVariable Integer id, @RequestBody RoleRequestDTO dto) {
        Role role = roleRepository.findById(id).orElseThrow();
        role.setRoleName(dto.getRoleName());
        Role saved = roleRepository.save(role);

        rolePermissionRepository.deleteByRole_RoleId(id);

        if (dto.getPermissionIds() != null) {
            for (Integer pid : dto.getPermissionIds()) {
                Permission p = permissionRepository.findById(pid).orElseThrow();
                RolePermission rp = new RolePermission();
                rp.setRole(saved);
                rp.setPermission(p);
                rolePermissionRepository.save(rp);
            }
        }

        Map<String, Object> res = new HashMap<>();
        res.put("role_id", saved.getRoleId());
        res.put("role_name", saved.getRoleName());
        res.put("permission_ids", dto.getPermissionIds() == null ? List.of() : dto.getPermissionIds());
        return res;
    }
}