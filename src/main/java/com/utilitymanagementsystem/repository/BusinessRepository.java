package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.Business;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessRepository extends JpaRepository<Business, Integer> {
    boolean existsByBusinessRegiNumAndCustomerIdNot(String businessRegiNum, Integer customerId);
    boolean existsByBusinessRegiNum(String businessRegiNum);
}
