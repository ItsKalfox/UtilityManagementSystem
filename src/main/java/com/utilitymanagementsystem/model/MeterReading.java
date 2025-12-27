package com.utilitymanagementsystem.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "meter_reading")
public class MeterReading {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reading_id", nullable = false)
    private Integer readingId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "field_officer_id", nullable = false)
    private FieldOfficer fieldOfficer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "connection_id", nullable = false)
    private UtilityConnection connection;

    @Column(name = "reading_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal readingValue;

    @Column(name = "consumption", precision = 10, scale = 2)
    private BigDecimal consumption;

    @Column(name = "billing_period_start")
    private Instant billingPeriodStart;

    @Column(name = "billing_period_end")
    private Instant billingPeriodEnd;

    public Integer getReadingId() {
        return readingId;
    }

    public void setReadingId(Integer readingId) {
        this.readingId = readingId;
    }

    public FieldOfficer getFieldOfficer() {
        return fieldOfficer;
    }

    public void setFieldOfficer(FieldOfficer fieldOfficer) {
        this.fieldOfficer = fieldOfficer;
    }

    public UtilityConnection getConnection() {
        return connection;
    }

    public void setConnection(UtilityConnection connection) {
        this.connection = connection;
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