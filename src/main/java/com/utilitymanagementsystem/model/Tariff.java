package com.utilitymanagementsystem.model;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "tariff")
public class Tariff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tariff_id", nullable = false)
    private Integer tariffId;

    @Column(name = "tariff_name", nullable = false, length = 100)
    private String tariffName;

    @Column(name = "tariff_description")
    private String tariffDescription;

    @ColumnDefault("0")
    @Column(name = "is_prorated", nullable = false)
    private Boolean isProrated = false;

    @Column(name = "fixed_charge", nullable = false, precision = 10, scale = 2)
    private BigDecimal fixedCharge;

    @Column(name = "tax_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxPercentage;

    @Column(name = "utility_type", nullable = false, length = 50)
    private String utilityType;

    @ColumnDefault("getdate()")
    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "status", nullable = false, length = 10)
    private String status;

    @OneToMany(mappedBy = "tariff")
    private Set<TariffSlab> tariffSlabs = new LinkedHashSet<>();

    @OneToMany(mappedBy = "tariff")
    private Set<UtilityConnection> utilityConnections = new LinkedHashSet<>();

    public Integer getTariffId() {
        return tariffId;
    }

    public void setTariffId(Integer tariffId) {
        this.tariffId = tariffId;
    }

    public String getTariffName() {
        return tariffName;
    }

    public void setTariffName(String tariffName) {
        this.tariffName = tariffName;
    }

    public String getTariffDescription() {
        return tariffDescription;
    }

    public void setTariffDescription(String tariffDescription) {
        this.tariffDescription = tariffDescription;
    }

    public Boolean getIsProrated() {
        return isProrated;
    }

    public void setIsProrated(Boolean isProrated) {
        this.isProrated = isProrated;
    }

    public BigDecimal getFixedCharge() {
        return fixedCharge;
    }

    public void setFixedCharge(BigDecimal fixedCharge) {
        this.fixedCharge = fixedCharge;
    }

    public BigDecimal getTaxPercentage() {
        return taxPercentage;
    }

    public void setTaxPercentage(BigDecimal taxPercentage) {
        this.taxPercentage = taxPercentage;
    }

    public String getUtilityType() {
        return utilityType;
    }

    public void setUtilityType(String utilityType) {
        this.utilityType = utilityType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Set<TariffSlab> getTariffSlabs() {
        return tariffSlabs;
    }

    public void setTariffSlabs(Set<TariffSlab> tariffSlabs) {
        this.tariffSlabs = tariffSlabs;
    }

    public Set<UtilityConnection> getUtilityConnections() {
        return utilityConnections;
    }

    public void setUtilityConnections(Set<UtilityConnection> utilityConnections) {
        this.utilityConnections = utilityConnections;
    }

}