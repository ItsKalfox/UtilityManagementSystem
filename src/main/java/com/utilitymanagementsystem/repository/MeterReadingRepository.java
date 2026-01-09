package com.utilitymanagementsystem.repository;

import com.utilitymanagementsystem.model.MeterReading;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeterReadingRepository
        extends JpaRepository<MeterReading, Integer> {
}
