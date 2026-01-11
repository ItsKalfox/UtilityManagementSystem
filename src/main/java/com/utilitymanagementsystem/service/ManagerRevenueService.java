package com.utilitymanagementsystem.service;


import com.utilitymanagementsystem.dto.manager.ManagerRevenueRecordDTO;
import com.utilitymanagementsystem.repository.ManagerRevenueRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ManagerRevenueService {

    private final ManagerRevenueRepository repository;

    public ManagerRevenueService(ManagerRevenueRepository repository) {
        this.repository = repository;
    }

    public List<ManagerRevenueRecordDTO> getRevenue(
            LocalDateTime start,
            LocalDateTime end,
            String utility
    ) {
        return repository.getRevenue(start, end, utility);
    }
}
