package com.utilitymanagementsystem.model;

import jakarta.persistence.*;

@Entity
@Table(name = "business")
public class Business {
    @Id
    @Column(name = "customer_id", nullable = false)
    private Integer customerId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "tax_id", length = 50)
    private String taxId;

    @Column(name = "business_regi_num", length = 50)
    private String businessRegiNum;

    @Column(name = "business_type", length = 100)
    private String businessType;

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public String getTaxId() {
        return taxId;
    }

    public void setTaxId(String taxId) {
        this.taxId = taxId;
    }

    public String getBusinessRegiNum() {
        return businessRegiNum;
    }

    public void setBusinessRegiNum(String businessRegiNum) {
        this.businessRegiNum = businessRegiNum;
    }

    public String getBusinessType() {
        return businessType;
    }

    public void setBusinessType(String businessType) {
        this.businessType = businessType;
    }

}