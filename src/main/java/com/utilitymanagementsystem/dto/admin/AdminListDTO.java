package com.utilitymanagementsystem.dto.admin;

public class AdminListDTO {
    private Integer userId;
    private String fullName;
    private String nic;
    private String roleName;
    private String status;

    public AdminListDTO(Integer userId, String fullName, String nic, String roleName, String status) {
        this.userId = userId;
        this.fullName = fullName;
        this.nic = nic;
        this.roleName = roleName;
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
    public String getRoleName() { return roleName; }
    public String getStatus() {
        return status;
    }
}
