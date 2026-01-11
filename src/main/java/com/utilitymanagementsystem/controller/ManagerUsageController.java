package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.manager.*;
import com.utilitymanagementsystem.repository.CustomerRepository;
import com.utilitymanagementsystem.repository.ManagerUsageRepository;
import com.utilitymanagementsystem.repository.UtilityConnectionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/manager/usage")
public class ManagerUsageController {

    private final ManagerUsageRepository managerUsageRepository;
    private final CustomerRepository customerRepository;
    private final UtilityConnectionRepository utilityConnectionRepository;

    public ManagerUsageController(
            ManagerUsageRepository managerUsageRepository,
            CustomerRepository customerRepository,
            UtilityConnectionRepository utilityConnectionRepository
    ) {
        this.managerUsageRepository = managerUsageRepository;
        this.customerRepository = customerRepository;
        this.utilityConnectionRepository = utilityConnectionRepository;
    }

    // ===== 1) Summary KPIs =====
    @GetMapping("/summary")
    public ResponseEntity<UsageSummaryDTO> summary() {
        UsageSummaryDTO dto = new UsageSummaryDTO();
        dto.totalIncome = managerUsageRepository.totalIncomeAll();
        dto.totalCustomers = customerRepository.count();
        dto.totalConnections = utilityConnectionRepository.count();
        return ResponseEntity.ok(dto);
    }

    // ===== 2) Utility overview =====
    @GetMapping("/utilities")
    public ResponseEntity<List<UtilityOverviewDTO>> utilities() {

        // Always return these 3 even if DB has none
        List<String> order = List.of("ELECTRICITY", "WATER", "GAS");
        Map<String, UtilityOverviewDTO> map = new HashMap<>();

        // default zeros
        for (String t : order) {
            UtilityOverviewDTO d = new UtilityOverviewDTO();
            d.utilityType = t;
            d.income = java.math.BigDecimal.ZERO;
            d.customers = 0;
            d.connections = 0;
            map.put(t, d);
        }

        for (ManagerUsageRepository.UtilityOverviewProjection p : managerUsageRepository.utilityOverview()) {
            String type = String.valueOf(p.getUtilityType()).toUpperCase();
            UtilityOverviewDTO d = map.getOrDefault(type, new UtilityOverviewDTO());
            d.utilityType = type;
            d.income = p.getIncome() == null ? java.math.BigDecimal.ZERO : p.getIncome();
            d.customers = p.getCustomers() == null ? 0 : p.getCustomers();
            d.connections = p.getConnections() == null ? 0 : p.getConnections();
            map.put(type, d);
        }

        List<UtilityOverviewDTO> out = new ArrayList<>();
        for (String t : order) out.add(map.get(t));

        // include any extra types in DB (if they exist)
        for (String t : map.keySet()) {
            if (!order.contains(t)) out.add(map.get(t));
        }

        return ResponseEntity.ok(out);
    }

    // ===== 3) Utility income detail report =====
    @GetMapping("/utilities/{utilityType}/income")
    public ResponseEntity<UtilityIncomeReportDTO> incomeReport(
            @PathVariable String utilityType,
            @RequestParam String from,
            @RequestParam String to
    ) {
        String type = utilityType == null ? "" : utilityType.trim().toUpperCase();
        if (!type.equals("ELECTRICITY") && !type.equals("WATER") && !type.equals("GAS")) {
            return ResponseEntity.badRequest().build();
        }

        LocalDate fromDate = LocalDate.parse(from);
        LocalDate toDate = LocalDate.parse(to);

        if (toDate.isBefore(fromDate)) {
            return ResponseEntity.badRequest().build();
        }

        ZoneId zone = ZoneId.systemDefault();
        Instant fromInstant = fromDate.atStartOfDay(zone).toInstant();
        // inclusive end (end of day)
        Instant toInstant = toDate.plusDays(1).atStartOfDay(zone).toInstant().minusMillis(1);

        UtilityIncomeReportDTO dto = new UtilityIncomeReportDTO();
        dto.utilityType = type;
        dto.from = fromDate;
        dto.to = toDate;

        dto.totalIncome = managerUsageRepository.incomeForUtilityBetween(type, fromInstant, toInstant);

        var rows = managerUsageRepository.utilityIncomeRowsBetween(type, fromInstant, toInstant);
        for (var r : rows) {
            UtilityIncomeRowDTO x = new UtilityIncomeRowDTO();
            x.customerId = r.getCustomerId();
            x.fullName = r.getFullName();
            x.connectionId = r.getConnectionId();
            x.billsCount = r.getBillsCount() == null ? 0 : r.getBillsCount();

            x.totalBilled = r.getTotalBilled();
            x.totalPaid = r.getTotalPaid();
            x.totalOutstanding = r.getTotalOutstanding();

            dto.rows.add(x);
        }

        return ResponseEntity.ok(dto);
    }
}
