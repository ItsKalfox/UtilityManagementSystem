package com.utilitymanagementsystem.dto.customer;

import java.time.Instant;

public class CustomerBillDTO {

    public Integer billId;
    public String utilityType;
    public Instant periodStart;
    public Instant periodEnd;
    public Double totalAmount;
    public Double outstandingAmount;
    public String status;
}
