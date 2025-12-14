package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.Customer;
import com.utilitymanagementsystem.model.Manager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Integer>, JpaSpecificationExecutor<Customer> {
    Optional<Customer> findByUser_UserId(Integer userId);
}