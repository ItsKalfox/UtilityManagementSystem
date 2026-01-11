package com.utilitymanagementsystem.dto.manager;

import java.math.BigDecimal;

public class UtilityIncomeRowDTO {
    public Integer customerId;
    public String fullName;
    public Integer connectionId;

    public long billsCount;

    public BigDecimal totalBilled;
    public BigDecimal totalPaid;
    public BigDecimal totalOutstanding;
}