package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.UtilityConnection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UtilityConnectionRepository extends JpaRepository<UtilityConnection, Integer> {
    long countByUtilityType(String utilityType);
    long countByUtilityTypeAndStatus(String utilityType, String status);
}