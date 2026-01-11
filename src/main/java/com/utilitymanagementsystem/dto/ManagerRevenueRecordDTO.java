package com.utilitymanagementsystem.dto.manager;

import java.time.LocalDateTime;

public class ManagerRevenueRecordDTO {

    private int billId;
    private String customerName;
    private String utilityType;
    private double amount;
    private String paymentStatus;   // ✅ ADD THIS
    private LocalDateTime paymentDate;

    public ManagerRevenueRecordDTO(
            int billId,
            String customerName,
            String utilityType,
            double amount,
            String paymentStatus,
            LocalDateTime paymentDate
    ) {
        this.billId = billId;
        this.customerName = customerName;
        this.utilityType = utilityType;
        this.amount = amount;
        this.paymentStatus = paymentStatus;
        this.paymentDate = paymentDate;
    }

    public int getBillId() { return billId; }
    public String getCustomerName() { return customerName; }
    public String getUtilityType() { return utilityType; }
    public double getAmount() { return amount; }
    public String getPaymentStatus() { return paymentStatus; }
    public LocalDateTime getPaymentDate() { return paymentDate; }
}
