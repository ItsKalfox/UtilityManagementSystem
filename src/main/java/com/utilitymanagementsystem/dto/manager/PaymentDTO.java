package com.utilitymanagementsystem.dto.manager;

import java.math.BigDecimal;

public class PaymentDTO {
    public Integer paymentId;
    public String paymentMethod;
    public BigDecimal amount;
    public String paymentDate;
    public Integer cashierId;
}