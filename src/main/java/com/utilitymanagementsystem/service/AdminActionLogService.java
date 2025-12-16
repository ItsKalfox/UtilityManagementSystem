package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.model.Admin;
import com.utilitymanagementsystem.model.AdminActionLog;
import com.utilitymanagementsystem.repository.AdminActionLogRepository;
import com.utilitymanagementsystem.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminActionLogService {

    private final AdminActionLogRepository logRepository;
    private final SecurityUtil securityUtil;

    public AdminActionLogService(
            AdminActionLogRepository logRepository,
            SecurityUtil securityUtil
    ) {
        this.logRepository = logRepository;
        this.securityUtil = securityUtil;
    }

    @Transactional
    public void logAction(
            String entityType,
            String entityId,
            String action
    ) {
        Admin admin = securityUtil.getCurrentAdmin();

        AdminActionLog log = new AdminActionLog();
        log.setAdmin(admin);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setAction(action);

        logRepository.save(log);
    }
}
