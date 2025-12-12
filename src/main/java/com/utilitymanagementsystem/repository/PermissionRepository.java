package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PermissionRepository extends JpaRepository<Permission, Integer> {
    @Query(value = """
        SELECT p.permission_name
        FROM permission p
        JOIN role_permission rp ON rp.permission_id = p.permission_id
        WHERE rp.role_id = :roleId
        """, nativeQuery = true)
    List<String> findPermissionNamesByRoleId(@Param("roleId") Integer roleId);
    @Query(value = """
        SELECT p.permission_id
        FROM permission p
        JOIN role_permission rp ON rp.permission_id = p.permission_id
        WHERE rp.role_id = :roleId
        """, nativeQuery = true)
    List<Integer> findPermissionIdsByRoleId(@Param("roleId") Integer roleId);
}