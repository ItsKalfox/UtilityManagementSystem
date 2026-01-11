package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.UtilityConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UtilityConnectionRepository extends JpaRepository<UtilityConnection, Integer> {

    // Count methods you already have
    long countByUtilityType(String utilityType);
    long countByUtilityTypeAndStatus(String utilityType, String status);

    // Get all connections by status
    List<UtilityConnection> findByStatus(String status);

    // Search connections by meter serial number (partial match)
    List<UtilityConnection> findByMeterSerialNumberContainingIgnoreCase(String term);

    // Filter by utility type and status
    List<UtilityConnection> findByUtilityTypeAndStatus(String utilityType, String status);

    // Custom JPQL example: get all connections for a specific customer
    @Query("SELECT u FROM UtilityConnection u WHERE u.customer.userId = :customerId")
    List<UtilityConnection> findByCustomerId(@Param("customerId") Integer customerId);

    List<UtilityConnection> findByCustomer_UserId(Integer customerId);
    List<UtilityConnection> findByCustomer_UserIdAndStatus(Integer customerId, String status);
}