package com.utilitymanagementsystem.dto.lists;

public class AreaListDTO {
    private String areaCode;
    private String areaName;

    public AreaListDTO(String areaCode, String areaName) {
        this.areaCode = areaCode;
        this.areaName = areaName;
    }

    public String getAreaCode() { return areaCode; }
    public void setAreaCode(String areaCode) { this.areaCode = areaCode; }
    public String getAreaName() { return areaName; }
    public void setAreaName(String areaName) { this.areaName = areaName; }
}