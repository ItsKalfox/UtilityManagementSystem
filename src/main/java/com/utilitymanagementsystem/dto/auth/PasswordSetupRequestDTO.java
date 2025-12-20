package com.utilitymanagementsystem.dto.auth;

public class PasswordSetupRequestDTO {
    private Integer userId;
    private String newPassword;
    private String userType;

    public PasswordSetupRequestDTO() {}

    public PasswordSetupRequestDTO(Integer userId, String newPassword,  String userType) {
        this.userId = userId;
        this.newPassword = newPassword;
        this.userType = userType;
    }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }
}
