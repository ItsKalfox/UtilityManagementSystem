package com.utilitymanagementsystem.model;

import jakarta.persistence.*;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "area")
public class Area {
    @Id
    @Column(name = "area_code", nullable = false, length = 10)
    private String areaCode;

    @Column(name = "area_name", nullable = false, length = 100)
    private String areaName;

    @OneToMany(mappedBy = "areaCode")
    private Set<Customer> customers = new LinkedHashSet<>();

    @OneToMany(mappedBy = "areaCode")
    private Set<FieldOfficer> fieldOfficers = new LinkedHashSet<>();

    public String getAreaCode() {
        return areaCode;
    }

    public void setAreaCode(String areaCode) {
        this.areaCode = areaCode;
    }

    public String getAreaName() {
        return areaName;
    }

    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }

    public Set<Customer> getCustomers() {
        return customers;
    }

    public void setCustomers(Set<Customer> customers) {
        this.customers = customers;
    }

    public Set<FieldOfficer> getFieldOfficers() {
        return fieldOfficers;
    }

    public void setFieldOfficers(Set<FieldOfficer> fieldOfficers) {
        this.fieldOfficers = fieldOfficers;
    }

}