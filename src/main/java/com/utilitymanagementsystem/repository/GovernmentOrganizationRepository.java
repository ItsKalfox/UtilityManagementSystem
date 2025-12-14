package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.GovernmentOrganization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GovernmentOrganizationRepository extends JpaRepository<GovernmentOrganization, Integer> {
}