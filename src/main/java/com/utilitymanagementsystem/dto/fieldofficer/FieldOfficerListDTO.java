package com.utilitymanagementsystem.dto.fieldofficer;

public class FieldOfficerListDTO {
    private Integer userId;
    private String fullName;
    private String nic;
    private String areaCode;
    private String status;

    public FieldOfficerListDTO(Integer userId, String fullName, String nic, String areaCode, String status) {
        this.userId = userId;
        this.fullName = fullName;
        this.nic = nic;
        this.areaCode = areaCode;
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

    public String getAreaCode() { return areaCode; }

    public String getStatus() {
        return status;
    }
}
