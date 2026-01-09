package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.UtilityConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface MeterHistoryRepository extends JpaRepository<UtilityConnection, Integer>{
    @Query(value = """
        SELECT * FROM utility_connection AS uc
        LEFT JOIN meter_reading AS mr ON uc.connection_id = mr.connection_id
        WHERE uc.customer_id = :customerId
        """, nativeQuery = true)
    List<Map<String, Object>> findMeterReadingsByCustomerId(@Param("customerId") Integer customerId);

    @Query(value = """
        SELECT * FROM utility_connection AS uc
        LEFT JOIN bill AS b ON uc.connection_id = b.connection_id
        WHERE uc.customer_id = :customerId
        """, nativeQuery = true)
    List<Map<String, Object>> findBillsByCustomerId(@Param("customerId") Integer customerId);
}
