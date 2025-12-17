package com.utilitymanagementsystem.dto;

import java.time.Instant;

public class ActionLogListDTO {
    private Integer logId;
    private Integer adminId;
    private String entityType;
    private String entityId;
    private String action;
    private Instant timestamp;

    public ActionLogListDTO(Integer logId,
                            Integer adminId,
                            String entityType,
                            String entityId,
                            String action,
                            Instant timestamp) {
        this.logId = logId;
        this.adminId = adminId;
        this.entityType = entityType;
        this.entityId = entityId;
        this.action = action;
        this.timestamp = timestamp;
    }

    public Integer getLogId() {return logId;}
    public void setLogId(Integer logId) {this.logId = logId;}

    public Integer getAdminId() {return adminId;}
    public void setAdminId(Integer adminId) {this.adminId = adminId;}

    public String getEntityType() {return entityType;}
    public void setEntityType(String entityType) {this.entityType = entityType;}

    public String getEntityId() {return entityId;}
    public void setEntityId(String entityId) {this.entityId = entityId;}

    public String getAction() {return action;}
    public void setAction(String action) {this.action = action;}

    public Instant getTimestamp() {return timestamp;}
    public void setTimestamp(Instant timestamp) {this.timestamp = timestamp;}
}
