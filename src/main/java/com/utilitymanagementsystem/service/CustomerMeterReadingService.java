package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.repository.CustomerMeterReadingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerMeterReadingService {

    private final CustomerMeterReadingRepository repository;

    public CustomerMeterReadingService(
            CustomerMeterReadingRepository repository) {
        this.repository = repository;
    }

    public List<Object[]> getMeterReadings(int customerId) {
        return repository.findMeterReadingsByCustomerId(customerId);
    }
}
