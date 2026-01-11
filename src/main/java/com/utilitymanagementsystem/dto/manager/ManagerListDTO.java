package com.utilitymanagementsystem.dto.manager;

public class ManagerListDTO {
    private Integer userId;
    private String fullName;
    private String nic;
    private String department;
    private String status;

    public ManagerListDTO(Integer userId, String fullName, String nic, String department, String status) {
        this.userId = userId;
        this.fullName = fullName;
        this.nic = nic;
        this.department = department;
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
    public String getDepartment() {
        return department;
    }
    public String getStatus() {
        return status;
    }
}