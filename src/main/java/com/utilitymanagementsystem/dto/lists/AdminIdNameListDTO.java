package com.utilitymanagementsystem.dto.lists;

public class AdminIdNameListDTO {
    private Integer adminId;
    private String adminName;

    public AdminIdNameListDTO(Integer adminId, String adminName) {
        this.adminId = adminId;
        this.adminName = adminName;
    }

    public Integer getAdminId() { return adminId; }
    public void setAdminId(Integer adminId) { this.adminId = adminId; }
    public String getAdminName() { return adminName; }
    public void setAdminName(String adminName) {  this.adminName = adminName; }
}