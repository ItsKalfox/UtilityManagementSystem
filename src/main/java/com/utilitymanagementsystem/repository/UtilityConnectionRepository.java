package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.UtilityConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UtilityConnectionRepository extends JpaRepository<UtilityConnection, Integer> {
    long countByUtilityType(String utilityType);
    long countByUtilityTypeAndStatus(String utilityType, String status);

    List<UtilityConnection> findByCustomer_UserId(Integer customerId);

    List<UtilityConnection> findByCustomer_UserIdAndStatus(Integer customerId, String status);
}