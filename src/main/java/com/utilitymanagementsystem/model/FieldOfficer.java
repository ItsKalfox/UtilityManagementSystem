package com.utilitymanagementsystem.model;

import jakarta.persistence.*;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "field_officer")
public class FieldOfficer {
    @Id
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_code")
    private Area areaCode;

    @Column(name = "vehicle_no", length = 20)
    private String vehicleNo;

    @OneToMany(mappedBy = "fieldOfficer")
    private Set<Complaint> complaints = new LinkedHashSet<>();

    @OneToMany(mappedBy = "fieldOfficer")
    private Set<MeterReading> meterReadings = new LinkedHashSet<>();

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Area getAreaCode() {
        return areaCode;
    }

    public void setAreaCode(Area areaCode) {
        this.areaCode = areaCode;
    }

    public String getVehicleNo() {
        return vehicleNo;
    }

    public void setVehicleNo(String vehicleNo) {
        this.vehicleNo = vehicleNo;
    }

    public Set<Complaint> getComplaints() {
        return complaints;
    }

    public void setComplaints(Set<Complaint> complaints) {
        this.complaints = complaints;
    }

    public Set<MeterReading> getMeterReadings() {
        return meterReadings;
    }

    public void setMeterReadings(Set<MeterReading> meterReadings) {
        this.meterReadings = meterReadings;
    }

}