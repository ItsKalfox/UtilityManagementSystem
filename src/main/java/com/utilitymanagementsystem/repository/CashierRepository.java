package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.Cashier;
import com.utilitymanagementsystem.model.Manager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CashierRepository extends JpaRepository<Cashier, Integer>, JpaSpecificationExecutor<Cashier> {
    Optional<Cashier> findByUser_UserId(Integer userId);
}