package com.utilitymanagementsystem.dto.auth;

public class PasswordSetupRequestDTO {
    private Integer userId;
    private String newPassword;

    public PasswordSetupRequestDTO() {}

    public PasswordSetupRequestDTO(Integer userId, String newPassword) {
        this.userId = userId;
        this.newPassword = newPassword;
    }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
