package com.utilitymanagementsystem.dto;

import java.util.ArrayList;
import java.util.List;

public class LoginResponseDTO {
    private Integer userId;
    private String email;
    private List<String> roles;
    private List<String> permissions = new ArrayList<>();
    private String token;


    public LoginResponseDTO() {}

    public LoginResponseDTO(Integer userId, String email, List<String> roles) {
        this.userId = userId;
        this.email = email;
        this.roles = roles;
    }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }

    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
