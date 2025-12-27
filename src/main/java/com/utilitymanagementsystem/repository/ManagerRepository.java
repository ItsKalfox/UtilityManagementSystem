package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.Customer;
import com.utilitymanagementsystem.model.Manager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ManagerRepository extends JpaRepository<Manager, Integer>, JpaSpecificationExecutor<Manager> {
    Optional<Manager> findByUser_UserId(Integer userId);
    boolean existsByUserId(Integer userId);

    long count();
    long countByStatus(String status);
}