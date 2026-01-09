//package com.utilitymanagementsystem.service;
//
//import com.utilitymanagementsystem.dto.meterreading.MeterReadingDetailDTO;
//import com.utilitymanagementsystem.dto.meterreading.MeterReadingListDTO;
//import com.utilitymanagementsystem.model.MeterReading;
//import com.utilitymanagementsystem.repository.MeterReadingRepository;
//import org.springframework.data.domain.*;
//import org.springframework.stereotype.Service;
//
//@Service
//public class MeterReadingService {
//
//    private final MeterReadingRepository repository;
//
//    public MeterReadingService(MeterReadingRepository repository) {
//        this.repository = repository;
//    }
//
//    public Page<MeterReadingListDTO> getMeterReadings(
//            int page, int size,
//            String sortBy, String direction
//    ) {
//        Pageable pageable = PageRequest.of(
//                page,
//                size,
//                Sort.by(Sort.Direction.fromString(direction), sortBy)
//        );
//
//        return repository.findAll(pageable)
//                .map(this::toListDTO);
//    }
//
//    public MeterReadingDetailDTO getMeterReading(Integer id) {
//        MeterReading reading = repository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Meter reading not found"));
//
//        return toDetailDTO(reading);
//    }
//
//    private MeterReadingListDTO toListDTO(MeterReading r) {
//        MeterReadingListDTO dto = new MeterReadingListDTO();
//        dto.setReadingId(r.getReadingId());
//        dto.setReadingValue(r.getReadingValue());
//        dto.setConsumption(r.getConsumption());
//        dto.setBillingPeriodStart(r.getBillingPeriodStart());
//        dto.setBillingPeriodEnd(r.getBillingPeriodEnd());
//        return dto;
//    }
//
//    private MeterReadingDetailDTO toDetailDTO(MeterReading r) {
//        MeterReadingDetailDTO dto = new MeterReadingDetailDTO();
//        dto.setReadingId(r.getReadingId());
//        dto.setReadingValue(r.getReadingValue());
//        dto.setConsumption(r.getConsumption());
//        dto.setBillingPeriodStart(r.getBillingPeriodStart());
//        dto.setBillingPeriodEnd(r.getBillingPeriodEnd());
//        dto.setFieldOfficerId(r.getFieldOfficer().getId());
//        dto.setConnectionId(r.getConnection().getId());
//        return dto;
//    }
//}
