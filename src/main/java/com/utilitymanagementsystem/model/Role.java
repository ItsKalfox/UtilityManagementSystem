package com.utilitymanagementsystem.model;

import jakarta.persistence.*;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "role")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id", nullable = false)
    private Integer roleId;

    @Column(name = "role_name", nullable = false, length = 100)
    private String roleName;

    // ✅ Removed Many-to-Many users mapping.
    // In this system, roles are assigned to Admin via admin.role_id (single role per admin),
    // and permissions are linked via role_permission.
    // Keeping this would make Hibernate expect a join table like "role_users".
    //
    // private Set<User> user;

    @OneToMany(mappedBy = "role")
    private Set<RolePermission> rolePermissions = new LinkedHashSet<>();

    public Integer getRoleId() {
        return roleId;
    }

    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public Set<RolePermission> getRolePermissions() {
        return rolePermissions;
    }

    public void setRolePermissions(Set<RolePermission> rolePermissions) {
        this.rolePermissions = rolePermissions;
    }
}
