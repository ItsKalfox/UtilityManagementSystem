package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.PhoneNumber;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhoneNumberRepository extends JpaRepository<PhoneNumber, Integer> {
}