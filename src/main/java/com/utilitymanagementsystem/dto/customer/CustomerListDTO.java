package com.utilitymanagementsystem.dto.customer;

public class CustomerListDTO {
    private Integer userId;
    private String fullName;
    private String nic;
    private String customerType;
    private String status;

    public CustomerListDTO(Integer userId, String fullName, String nic, String customerType, String status) {
        this.userId = userId;
        this.fullName = fullName;
        this.nic = nic;
        this.customerType = customerType;
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

    public String getCustomerType() {
        return customerType;
    }

    public String getStatus() {
        return status;
    }
}
