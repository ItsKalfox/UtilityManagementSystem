package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.Household;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HouseholdRepository extends JpaRepository<Household, Integer> {
}