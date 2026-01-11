package com.utilitymanagementsystem.dto.manager;

import java.util.List;

public class ManagerDefaulterDetailsDTO {
    public Integer customerId;
    public String fullName;
    public String email;
    public String nic;
    public String customerType;
    public String status;
    public String areaCode;
    public String areaName;
    public String addressLine1;
    public String addressLine2;
    public String addressCity;
    public String addressPostalCode;

    public List<BillWithPaymentsDTO> bills;
}
