package com.utilitymanagementsystem.dto.auth;

public class LoginResponseDTO {
    private Integer userId;
    private String fullName;
    private String email;
    private String token;

    public LoginResponseDTO() {}

    public LoginResponseDTO(Integer userId, String fullName, String email) {
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
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}