package com.utilitymanagementsystem.dto.meterreading;

import java.math.BigDecimal;
import java.time.Instant;

public class MeterReadingListDTO {

    private Integer readingId;
    private BigDecimal readingValue;
    private BigDecimal consumption;
    private Instant billingPeriodStart;
    private Instant billingPeriodEnd;

    public Integer getReadingId() {
        return readingId;
    }

    public void setReadingId(Integer readingId) {
        this.readingId = readingId;
    }

    public BigDecimal getReadingValue() {
        return readingValue;
    }

    public void setReadingValue(BigDecimal readingValue) {
        this.readingValue = readingValue;
    }

    public BigDecimal getConsumption() {
        return consumption;
    }

    public void setConsumption(BigDecimal consumption) {
        this.consumption = consumption;
    }

    public Instant getBillingPeriodStart() {
        return billingPeriodStart;
    }

    public void setBillingPeriodStart(Instant billingPeriodStart) {
        this.billingPeriodStart = billingPeriodStart;
    }

    public Instant getBillingPeriodEnd() {
        return billingPeriodEnd;
    }

    public void setBillingPeriodEnd(Instant billingPeriodEnd) {
        this.billingPeriodEnd = billingPeriodEnd;
    }
}
