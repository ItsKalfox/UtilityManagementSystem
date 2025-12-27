package com.utilitymanagementsystem.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tariff_slab")
public class TariffSlab {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "slab_id", nullable = false)
    private Integer slabId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tariff_id", nullable = false)
    private Tariff tariff;

    @Column(name = "slab_order", nullable = false)
    private Integer slabOrder;

    @Column(name = "start_unit", nullable = false)
    private Integer startUnit;

    @Column(name = "end_unit")
    private Integer endUnit;

    @Column(name = "unit_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitRate;

    public Integer getSlabId() {
        return slabId;
    }

    public void setSlabId(Integer slabId) {
        this.slabId = slabId;
    }

    public Tariff getTariff() {
        return tariff;
    }

    public void setTariff(Tariff tariff) {
        this.tariff = tariff;
    }

    public Integer getSlabOrder() {
        return slabOrder;
    }

    public void setSlabOrder(Integer slabOrder) {
        this.slabOrder = slabOrder;
    }

    public Integer getStartUnit() {
        return startUnit;
    }

    public void setStartUnit(Integer startUnit) {
        this.startUnit = startUnit;
    }

    public Integer getEndUnit() {
        return endUnit;
    }

    public void setEndUnit(Integer endUnit) {
        this.endUnit = endUnit;
    }

    public BigDecimal getUnitRate() {
        return unitRate;
    }

    public void setUnitRate(BigDecimal unitRate) {
        this.unitRate = unitRate;
    }
}