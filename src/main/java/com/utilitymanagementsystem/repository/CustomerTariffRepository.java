package com.utilitymanagementsystem.repository;
import com.utilitymanagementsystem.model.UtilityConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerTariffRepository
        extends JpaRepository<UtilityConnection, Integer>
{
    @Query(value = """
        SELECT
            t.tariff_name,
            t.utility_type,
            t.fixed_charge,
            t.tax_percentage,
            t.is_prorated,
            uc.meter_serial_number,
            uc.install_date,
            uc.status
        FROM utility_connection uc
        JOIN tariff t ON uc.tariff_id = t.tariff_id
        WHERE uc.customer_id = :customerId
        ORDER BY uc.install_date DESC
        """, nativeQuery = true)
    List<?> findTariffHistory(@Param("customerId") int customerId);
}