package com.utilitymanagementsystem.dto.user;

public class UserListDTO {
    private Integer userId;
    private String fullName;
    private String nic;
    private String status;

    public UserListDTO(Integer userId, String fullName, String nic, String status) {
        this.userId = userId;
        this.fullName = fullName;
        this.nic = nic;
        this.status = status;
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

    public String getStatus() {
        return status;
    }
}
