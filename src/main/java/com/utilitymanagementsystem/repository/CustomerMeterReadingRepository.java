package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.UtilityConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerMeterReadingRepository
        extends JpaRepository<UtilityConnection, Integer> {

    @Query(value = """
        SELECT 
            mr.billing_period_start,
            mr.billing_period_end,
            mr.reading_value,
            mr.consumption
        FROM utility_connection uc
        JOIN meter_reading mr 
            ON uc.connection_id = mr.connection_id
        WHERE uc.customer_id = :customerId
        ORDER BY mr.billing_period_end DESC
        """, nativeQuery = true)
    List<Object[]> findMeterReadingsByCustomerId(
            @Param("customerId") int customerId
    );
}