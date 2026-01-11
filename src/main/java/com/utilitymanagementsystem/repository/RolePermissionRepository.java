package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Integer> {
    void deleteByRole_RoleId(Integer roleId);
}
