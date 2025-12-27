package com.utilitymanagementsystem.dto.fieldofficer;

public class FieldOfficerListDTO {
    private Integer userId;
    private String fullName;
    private String nic;
    private String vehicleNo;
    private String status;

    public FieldOfficerListDTO(Integer userId, String fullName, String nic, String vehicleNo, String status) {
        this.userId = userId;
        this.fullName = fullName;
        this.nic = nic;
        this.vehicleNo = vehicleNo;
        this.status = status;
    }

    public Integer getUserId() {
        return userId;
    }
    public String getFullName() {
        return fullName;
    }
    public String getNic() {
        return nic;
    }
    public String getVehicleNo() { return vehicleNo; }
    public String getStatus() {
        return status;
    }
}
