package com.UtilityManagementSystem.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "cash")
public class Cash {
    @Id
    @Column(name = "payment_id", nullable = false)
    private Integer paymentId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @Column(name = "amount_given", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountGiven;

    @Column(name = "balance", precision = 10, scale = 2)
    private BigDecimal balance;

    public Integer getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Integer paymentId) {
        this.paymentId = paymentId;
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    public BigDecimal getAmountGiven() {
        return amountGiven;
    }

    public void setAmountGiven(BigDecimal amountGiven) {
        this.amountGiven = amountGiven;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

}