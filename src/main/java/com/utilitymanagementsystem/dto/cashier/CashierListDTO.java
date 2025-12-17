package com.utilitymanagementsystem.dto.cashier;

public class CashierListDTO {
    private Integer userId;
    private String fullName;
    private String nic;
    private String branchName;
    private String status;

    public CashierListDTO(Integer userId, String fullName, String nic, String branchName, String status) {
        this.userId = userId;
        this.fullName = fullName;
        this.nic = nic;
        this.branchName = branchName;
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

    public String getBranchName() {
        return branchName;
    }

    public String getStatus() {
        return status;
    }
}
