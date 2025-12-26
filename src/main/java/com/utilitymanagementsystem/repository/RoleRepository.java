package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.dto.lists.AreaListDTO;
import com.utilitymanagementsystem.dto.lists.RoleListDTO;
import com.utilitymanagementsystem.model.Area;
import com.utilitymanagementsystem.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    @Query("""
        SELECT new com.utilitymanagementsystem.dto.lists.RoleListDTO(
            r.roleId,
            r.roleName
        )
        FROM Role r
        ORDER BY r.roleId
    """)
    List<RoleListDTO> findAllRoles();
}