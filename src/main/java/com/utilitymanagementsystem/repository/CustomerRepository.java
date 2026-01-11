package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.Customer;
import com.utilitymanagementsystem.model.Manager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Integer>, JpaSpecificationExecutor<Customer> {
    Optional<Customer> findByUser_UserId(Integer userId);
    boolean existsByUserId(Integer userId);
    long count();
    long countByStatus(String status);

    @Query("""
    select distinct c
    from Customer c
    join c.user u
    left join u.phoneNumbers p
    left join c.utilityConnections uc
    where
        (
            :q is null or :q = ''
            or lower(u.fullName) like lower(concat('%', :q, '%'))
            or lower(u.email) like lower(concat('%', :q, '%'))
            or lower(u.nic) like lower(concat('%', :q, '%'))
            or concat('', c.userId) like concat('%', :q, '%')
            or p.phoneNumber like concat('%', :q, '%')
            or lower(uc.meterSerialNumber) like lower(concat('%', :q, '%'))
        )
        and (
            :customerType is null or :customerType = ''
            or lower(c.customerType) = lower(:customerType)
        )
        and (
            :connectionType is null or :connectionType = ''
            or lower(uc.utilityType) = lower(:connectionType)
        )
    """)
    List<Customer> cashierSearchCustomers(
            @Param("q") String q,
            @Param("customerType") String customerType,
            @Param("connectionType") String connectionType,
            Pageable pageable
    );
}