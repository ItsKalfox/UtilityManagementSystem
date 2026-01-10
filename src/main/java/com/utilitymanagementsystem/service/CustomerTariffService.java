package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.repository.CustomerTariffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerTariffService {

    private final CustomerTariffRepository repository;

    @Autowired
    public CustomerTariffService(CustomerTariffRepository repository) {
        this.repository = repository;
    }

    public List<?> getTariffHistory(int customerId) {
        return repository.findTariffHistory(customerId);
    }
}
