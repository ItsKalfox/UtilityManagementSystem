package com.utilitymanagementsystem.dto;

import java.util.List;

public class LoginResponseDTO {
    private Integer userId;
    private String email;
    private List<RoleDTO> roles;

    public LoginResponseDTO() {}

    public LoginResponseDTO(Integer userId, String email, List<RoleDTO> roles) {
        this.userId = userId;
        this.email = email;
        this.roles = roles;
    }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<RoleDTO> getRoles() { return roles; }
    public void setRoles(List<RoleDTO> roles) { this.roles = roles; }
}
