package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.Admin;
import com.utilitymanagementsystem.model.FieldOfficer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer>, JpaSpecificationExecutor<Admin> {
    Optional<Admin> findByUser_UserId(Integer userId);
    boolean existsByUserId(Integer userId);
}
