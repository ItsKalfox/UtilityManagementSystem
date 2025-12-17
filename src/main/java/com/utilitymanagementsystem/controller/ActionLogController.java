package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.auth.ActionLogListDTO;
import com.utilitymanagementsystem.service.AdminActionLogService;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/action-log")
public class ActionLogController {

    private final AdminActionLogService adminActionLogServiceService;

    public ActionLogController(AdminActionLogService adminActionLogServiceService) {
        this.adminActionLogServiceService = adminActionLogServiceService;
    }

    @PreAuthorize("hasAuthority('READ_ACTION_LOGS')")
    @GetMapping
    public Page<ActionLogListDTO> listActionLogs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String entity,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Integer adminId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "timeStamp") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        return adminActionLogServiceService.getActionLogs(
                search, entity, action, adminId,
                from, to,
                page, size,
                sortBy, direction
        );
    }
}
