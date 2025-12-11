package com.utilitymanagementsystem.dto;

/**
 * Simple DTO sent to frontend describing each available role for the user.
 */
public class RoleDTO {
    private String roleName; // e.g. "ADMIN", "MANAGER", "CASHIER", "FIELD_OFFICER"
    private Integer id;      // user_id (same as User.userId in your schema)
    private String email;

    public RoleDTO() {}

    public RoleDTO(String roleName, Integer id, String email) {
        this.roleName = roleName;
        this.id = id;
        this.email = email;
    }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
