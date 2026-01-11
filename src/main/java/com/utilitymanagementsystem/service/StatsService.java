
package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.stats.AdminDashboardStatDTO;
import com.utilitymanagementsystem.repository.*;
import org.springframework.stereotype.Service;

@Service
public class StatsService {
    private final CustomerRepository customerRepository;
    private final AdminRepository adminRepository;
    private final ManagerRepository managerRepository;
    private final CashierRepository cashierRepository;
    private final FieldOfficerRepository fieldOfficerRepository;
    private final UtilityConnectionRepository utilityConnectionRepository;
    private final ComplaintRepository complaintRepository;

    public StatsService(
            CustomerRepository customerRepository,
            AdminRepository adminRepository,
            ManagerRepository managerRepository,
            CashierRepository cashierRepository,
            FieldOfficerRepository fieldOfficerRepository,
            UtilityConnectionRepository utilityConnectionRepository,
            ComplaintRepository complaintRepository
    ) {
        this.customerRepository = customerRepository;
        this.adminRepository = adminRepository;
        this.managerRepository = managerRepository;
        this.cashierRepository = cashierRepository;
        this.fieldOfficerRepository = fieldOfficerRepository;
        this.utilityConnectionRepository = utilityConnectionRepository;
        this.complaintRepository = complaintRepository;
    }

    public AdminDashboardStatDTO getAdminStats() {

        return new AdminDashboardStatDTO(
                (int) customerRepository.count(),
                (int) customerRepository.countByStatus("ACTIVE"),
                (int) adminRepository.count(),
                (int) adminRepository.countByStatus("ACTIVE"),
                (int) managerRepository.count(),
                (int) managerRepository.countByStatus("ACTIVE"),
                (int) cashierRepository.count(),
                (int) cashierRepository.countByStatus("ACTIVE"),
                (int) fieldOfficerRepository.count(),
                (int) fieldOfficerRepository.countByStatus("ACTIVE"),
                (int) utilityConnectionRepository.countByUtilityType("WATER"),
                (int) utilityConnectionRepository.countByUtilityTypeAndStatus("WATER", "ACTIVE"),
                (int) utilityConnectionRepository.countByUtilityType("ELECTRICITY"),
                (int) utilityConnectionRepository.countByUtilityTypeAndStatus("ELECTRICITY", "ACTIVE"),
                (int) utilityConnectionRepository.countByUtilityType("GAS"),
                (int) utilityConnectionRepository.countByUtilityTypeAndStatus("GAS", "ACTIVE"),
                (int) complaintRepository.countByStatus("OPEN"),
                (int) complaintRepository.countByStatus("IN PROGRESS"),
                (int) complaintRepository.countByStatus("RESOLVED"),
                (int) complaintRepository.countUrgentComplaints()
        );
    }
}
