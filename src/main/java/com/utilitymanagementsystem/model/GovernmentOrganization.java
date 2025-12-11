package com.utilitymanagementsystem.model;

import jakarta.persistence.*;

@Entity
@Table(name = "government_organization")
public class GovernmentOrganization {
    @Id
    @Column(name = "customer_id", nullable = false)
    private Integer customerId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "government_id", length = 50)
    private String governmentId;

    @Column(name = "department", length = 100)
    private String department;

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

    public String getGovernmentId() {
        return governmentId;
    }

    public void setGovernmentId(String governmentId) {
        this.governmentId = governmentId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

}