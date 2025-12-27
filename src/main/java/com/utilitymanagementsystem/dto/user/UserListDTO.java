package com.utilitymanagementsystem.dto.user;

public class UserListDTO {
    private Integer userId;
    private String fullName;
    private String nic;

    public UserListDTO(Integer userId, String fullName, String nic) {
        this.userId = userId;
        this.fullName = fullName;
        this.nic = nic;
    }

    public Integer getUserId() {
        return userId;
    }
    public String getFullName() {
        return fullName;
    }
    public String getNic() {
        return nic;
    }
}
