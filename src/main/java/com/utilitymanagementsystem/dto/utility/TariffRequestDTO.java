package com.utilitymanagementsystem.dto.tariff;

import java.math.BigDecimal;
import java.util.List;

public class TariffRequestDTO {
    private String tariffName;
    private String tariffDescription;
    private Boolean isProrated;
    private BigDecimal fixedCharge;
    private BigDecimal taxPercentage;
    private String utilityType; // ELECTRICITY/WATER/GAS
    private String status; // ACTIVE/INACTIVE
    private List<TariffSlabDTO> slabs;

    public static class TariffSlabDTO {
        private Integer slabOrder;
        private Integer startUnit;
        private Integer endUnit; // null allowed
        private BigDecimal unitRate;

        public Integer getSlabOrder() { return slabOrder; }
        public void setSlabOrder(Integer slabOrder) { this.slabOrder = slabOrder; }
        public Integer getStartUnit() { return startUnit; }
        public void setStartUnit(Integer startUnit) { this.startUnit = startUnit; }
        public Integer getEndUnit() { return endUnit; }
        public void setEndUnit(Integer endUnit) { this.endUnit = endUnit; }
        public BigDecimal getUnitRate() { return unitRate; }
        public void setUnitRate(BigDecimal unitRate) { this.unitRate = unitRate; }
    }

    // getters/setters...
    public String getTariffName() { return tariffName; }
    public void setTariffName(String tariffName) { this.tariffName = tariffName; }
    public String getTariffDescription() { return tariffDescription; }
    public void setTariffDescription(String tariffDescription) { this.tariffDescription = tariffDescription; }
    public Boolean getIsProrated() { return isProrated; }
    public void setIsProrated(Boolean isProrated) { this.isProrated = isProrated; }
    public BigDecimal getFixedCharge() { return fixedCharge; }
    public void setFixedCharge(BigDecimal fixedCharge) { this.fixedCharge = fixedCharge; }
    public BigDecimal getTaxPercentage() { return taxPercentage; }
    public void setTaxPercentage(BigDecimal taxPercentage) { this.taxPercentage = taxPercentage; }
    public String getUtilityType() { return utilityType; }
    public void setUtilityType(String utilityType) { this.utilityType = utilityType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<TariffSlabDTO> getSlabs() { return slabs; }
    public void setSlabs(List<TariffSlabDTO> slabs) { this.slabs = slabs; }
}
