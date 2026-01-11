package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface ManagerUsageRepository extends JpaRepository<Payment, Integer> {
    @Query("select coalesce(sum(p.amount), 0) from Payment p")
    BigDecimal totalIncomeAll();

    interface UtilityOverviewProjection {
        String getUtilityType();
        BigDecimal getIncome();
        Long getCustomers();
        Long getConnections();
    }

    @Query("""
        select 
            uc.utilityType as utilityType,
            coalesce(sum(p.amount), 0) as income,
            count(distinct c.userId) as customers,
            count(distinct uc.connectionId) as connections
        from UtilityConnection uc
        join uc.customer c
        left join uc.bills b
        left join b.payments p
        group by uc.utilityType
    """)
    List<UtilityOverviewProjection> utilityOverview();

    @Query("""
        select coalesce(sum(p.amount), 0)
        from Payment p
        join p.bill b
        join b.connection uc
        where uc.utilityType = :utilityType
          and p.paymentDate between :from and :to
    """)
    BigDecimal incomeForUtilityBetween(
            @Param("utilityType") String utilityType,
            @Param("from") Instant from,
            @Param("to") Instant to
    );

    interface UtilityIncomeRowProjection {
        Integer getCustomerId();
        String getFullName();
        Integer getConnectionId();
        Long getBillsCount();
        BigDecimal getTotalBilled();
        BigDecimal getTotalPaid();
        BigDecimal getTotalOutstanding();
    }

    @Query("""
        select
            c.userId as customerId,
            u.fullName as fullName,
            uc.connectionId as connectionId,
            count(distinct b.billId) as billsCount,
            coalesce(sum(b.totalBillAmount), 0) as totalBilled,
            coalesce(sum(p.amount), 0) as totalPaid,
            coalesce(sum(b.outstandingAmount), 0) as totalOutstanding
        from UtilityConnection uc
        join uc.customer c
        join c.user u
        left join uc.bills b
        left join b.payments p
            on p.paymentDate between :from and :to
        where uc.utilityType = :utilityType
          and b.periodEnd between :from and :to
        group by c.userId, u.fullName, uc.connectionId
        order by coalesce(sum(p.amount), 0) desc
    """)
    List<UtilityIncomeRowProjection> utilityIncomeRowsBetween(
            @Param("utilityType") String utilityType,
            @Param("from") Instant from,
            @Param("to") Instant to
    );
}