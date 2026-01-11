package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.customer.CustomerDetailView;
import com.utilitymanagementsystem.dto.customer.CustomerListDTO;
import com.utilitymanagementsystem.dto.meterreading.AddMeterReadingDTO;
import com.utilitymanagementsystem.repository.MeterHistoryRepository;
import com.utilitymanagementsystem.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/meter-reading")
public class MeterReadingController {
    private final CustomerService customerService;
    private final MeterHistoryRepository meterHistoryRepository;

    public MeterReadingController(
            CustomerService customerService,
            MeterHistoryRepository meterHistoryRepository
    ) {
        this.customerService = customerService;
        this.meterHistoryRepository = meterHistoryRepository;
    }

    @GetMapping("customers")
    public Page<CustomerListDTO> listCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "userId") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        return customerService.getCustomers(
                search, type, status,
                page, size,
                sortBy, direction
        );
    }

    @GetMapping("customers/{id}")
    public CustomerDetailView getCustomer(@PathVariable Integer id) {
        return customerService.getCustomerDetails(id);
    }

    @PostMapping("add")
    @ResponseStatus(HttpStatus.CREATED)
    public AddMeterReadingDTO addMeterReading(@RequestBody AddMeterReadingDTO dto) {
        System.out.println("-------------------------------------------------------------------------------------");
        System.out.println(dto);
        OffsetDateTime start = OffsetDateTime.parse(dto.billing_period_start());
        OffsetDateTime end   = OffsetDateTime.parse(dto.billing_period_end());

        meterHistoryRepository.addMeterReading(
            dto.field_officer_id(), dto.connection_id(), dto.reading_value(), dto.consumption(), start, end);
        return dto;
    }

    @GetMapping("history/{id}")
    public Map<String, Object> getHistory(@PathVariable Integer id) {
        var bills =  meterHistoryRepository.findBillsByCustomerId(id);
        var meter_readings = meterHistoryRepository.findMeterReadingsByCustomerId(id);
        Map<String, Object> data = new HashMap<>();
        data.put("bills", bills);
        data.put("meterReadings", meter_readings);
        return data;
    }

    @GetMapping("get-details/{id}")
    public Map<String, Object> getDetails(@PathVariable Integer id) {
        var meter_readings = meterHistoryRepository.findMeterReadingsByCustomerId(id);
        Map<Integer, Map<String, Object>> lastReadingsPerConnection =
                meter_readings.stream()
                        .collect(Collectors.groupingBy(
                                r -> ((Number) r.get("connection_id")).intValue(),
                                Collectors.collectingAndThen(
                                        Collectors.maxBy((a, b) -> {
                                            Double r1 = ((Number) a.get("reading_value")).doubleValue();
                                            Double r2 = ((Number) b.get("reading_value")).doubleValue();
                                            return r1.compareTo(r2);
                                        }),
                                        opt -> opt.orElse(null)
                                )
                        ));
        var meters = meterHistoryRepository.findSerialNumberByCustomerId(id);

        Map<String, Object> data = new HashMap<>();
        data.put("last_reading", lastReadingsPerConnection);
        data.put("meters", meters);
        return data;
    }
}
