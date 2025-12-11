package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.FieldOfficer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FieldOfficerRepository extends JpaRepository<FieldOfficer, Integer> {
    Optional<FieldOfficer> findByUser_UserId(Integer userId);
}