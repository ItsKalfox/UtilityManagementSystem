package com.utilitymanagementsystem.dto.customer;
import com.utilitymanagementsystem.dto.customer.ComplaintRequestDTO;

public class ComplaintRequestDTO {

    private Integer customerId;
    private String complaintType;
    private String description;

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
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
}