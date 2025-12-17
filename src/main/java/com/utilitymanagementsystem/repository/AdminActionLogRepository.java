package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.AdminActionLog;
import com.utilitymanagementsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AdminActionLogRepository extends JpaRepository<AdminActionLog, Integer>, JpaSpecificationExecutor<AdminActionLog> {
}