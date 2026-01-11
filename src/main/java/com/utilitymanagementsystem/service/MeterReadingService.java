package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.repository.MeterHistoryRepository;
import org.springframework.stereotype.Service;

@Service
public class MeterReadingService {
    private final MeterHistoryRepository meterHistoryRepository;

    public MeterReadingService(MeterHistoryRepository meterHistoryRepository) {
        this.meterHistoryRepository = meterHistoryRepository;
    }
}