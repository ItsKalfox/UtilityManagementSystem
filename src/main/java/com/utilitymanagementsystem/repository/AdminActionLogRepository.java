package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.AdminActionLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminActionLogRepository extends JpaRepository<AdminActionLog, Integer> {
}