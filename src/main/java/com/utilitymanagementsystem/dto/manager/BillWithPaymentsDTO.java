package com.utilitymanagementsystem.dto.manager;

import java.math.BigDecimal;
import java.util.List;

public class BillWithPaymentsDTO {
    public Integer billId;
    public Integer connectionId;
    public String utilityType;

    public String periodStart;
    public String periodEnd;

    public BigDecimal totalBillAmount;
    public BigDecimal outstandingAmount;
    public String status;

    public List<PaymentDTO> payments;
}
