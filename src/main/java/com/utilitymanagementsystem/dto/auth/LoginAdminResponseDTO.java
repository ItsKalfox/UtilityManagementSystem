package com.utilitymanagementsystem.dto.auth;

import java.util.ArrayList;
import java.util.List;

public class LoginAdminResponseDTO {
    private Integer userId;
    private String fullName;
    private String email;
    private String adminRole;
    private List<String> permissions = new ArrayList<>();
    private String token;

    public LoginAdminResponseDTO() {}

    public LoginAdminResponseDTO(Integer userId, String fullName, String email) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
    }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAdminRole() { return adminRole; }
    public void setAdminRole(String adminRole) { this.adminRole = adminRole; }
    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
