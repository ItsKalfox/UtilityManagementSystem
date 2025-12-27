package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.auth.ActionLogListDTO;
import com.utilitymanagementsystem.model.Admin;
import com.utilitymanagementsystem.model.AdminActionLog;
import com.utilitymanagementsystem.repository.AdminActionLogRepository;
import com.utilitymanagementsystem.security.SecurityUtil;
import com.utilitymanagementsystem.spec.ActionLogSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AdminActionLogService {

    private final AdminActionLogRepository logRepository;
    private final SecurityUtil securityUtil;
    private final AdminActionLogRepository adminActionLogRepository;

    public AdminActionLogService(
            AdminActionLogRepository logRepository,
            SecurityUtil securityUtil,
            AdminActionLogRepository adminActionLogRepository
    ) {
        this.logRepository = logRepository;
        this.securityUtil = securityUtil;
        this.adminActionLogRepository = adminActionLogRepository;
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

    @Transactional (readOnly = true)
    public Page<ActionLogListDTO> getActionLogs(
            String search,
            String entity,
            Integer adminId,
            LocalDateTime from,
            LocalDateTime to,
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<AdminActionLog> spec =
                ActionLogSpecification.hasSearch(search)
                        .and(ActionLogSpecification.hasEntity(entity))
                        .and(ActionLogSpecification.hasAdminId(adminId))
                        .and(ActionLogSpecification.hasDateRange(from, to));

        Page<AdminActionLog> actionLogs = adminActionLogRepository.findAll(spec, pageable);

        return actionLogs.map(al ->
                new ActionLogListDTO(
                        al.getLogId(),
                        al.getAdmin().getUserId(),
                        al.getEntityType(),
                        al.getEntityId(),
                        al.getAction(),
                        al.getTimeStamp()
                )
        );
    }
}
