package com.UtilityManagementSystem.model;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Entity
@Table(name = "complaint")
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "complaint_id", nullable = false)
    private Integer complaintId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "field_officer_id", nullable = false)
    private FieldOfficer fieldOfficer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;

    @Column(name = "complaint_type", nullable = false, length = 100)
    private String complaintType;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @ColumnDefault("getdate()")
    @Column(name = "submitted_date")
    private Instant submittedDate;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "resolved_date")
    private Instant resolvedDate;

    @Column(name = "resolution_notes", length = 500)
    private String resolutionNotes;

    public Integer getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(Integer complaintId) {
        this.complaintId = complaintId;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public FieldOfficer getFieldOfficer() {
        return fieldOfficer;
    }

    public void setFieldOfficer(FieldOfficer fieldOfficer) {
        this.fieldOfficer = fieldOfficer;
    }

    public Admin getAdmin() {
        return admin;
    }

    public void setAdmin(Admin admin) {
        this.admin = admin;
    }

    public String getComplaintType() {
        return complaintType;
    }

    public void setComplaintType(String complaintType) {
        this.complaintType = complaintType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getSubmittedDate() {
        return submittedDate;
    }

    public void setSubmittedDate(Instant submittedDate) {
        this.submittedDate = submittedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getResolvedDate() {
        return resolvedDate;
    }

    public void setResolvedDate(Instant resolvedDate) {
        this.resolvedDate = resolvedDate;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

}