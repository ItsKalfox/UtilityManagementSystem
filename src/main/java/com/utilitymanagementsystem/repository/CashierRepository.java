package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.Cashier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CashierRepository extends JpaRepository<Cashier, Integer> {
    Optional<Cashier> findByUser_UserId(Integer userId);
}