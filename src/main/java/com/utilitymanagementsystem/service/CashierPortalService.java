package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.cashier.CashierCustomerSearchDTO;
import com.utilitymanagementsystem.model.Customer;
import com.utilitymanagementsystem.model.PhoneNumber;
import com.utilitymanagementsystem.repository.CustomerRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.utilitymanagementsystem.dto.cashier.CashierBillDTO;
import com.utilitymanagementsystem.dto.cashier.CashierConnectionDTO;
import com.utilitymanagementsystem.model.Bill;
import com.utilitymanagementsystem.model.UtilityConnection;
import com.utilitymanagementsystem.repository.BillRepository;
import com.utilitymanagementsystem.repository.UtilityConnectionRepository;
import com.utilitymanagementsystem.dto.cashier.CashierBillHistoryDTO;
import com.utilitymanagementsystem.dto.cashier.CashierBillListItemDTO;

import java.util.List;

@Service
public class CashierPortalService {

    private final CustomerRepository customerRepository;
    private final UtilityConnectionRepository utilityConnectionRepository;
    private final BillRepository billRepository;

    public CashierPortalService(
            CustomerRepository customerRepository,
            UtilityConnectionRepository utilityConnectionRepository,
            BillRepository billRepository
    ) {
        this.customerRepository = customerRepository;
        this.utilityConnectionRepository = utilityConnectionRepository;
        this.billRepository = billRepository;
    }

    @Transactional(readOnly = true)
    public List<CashierCustomerSearchDTO> searchCustomers(String q, String customerType, String connectionType, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        Pageable pageable = PageRequest.of(0, safeLimit);

        List<Customer> customers = customerRepository.cashierSearchCustomers(q, customerType, connectionType, pageable);

        return customers.stream().map(c -> {
            String phone = null;
            if (c.getUser() != null && c.getUser().getPhoneNumbers() != null) {
                phone = c.getUser().getPhoneNumbers().stream()
                        .map(PhoneNumber::getPhoneNumber)
                        .findFirst()
                        .orElse(null);
            }

            return new CashierCustomerSearchDTO(
                    c.getUserId(),
                    c.getUser() != null ? c.getUser().getFullName() : null,
                    c.getUser() != null ? c.getUser().getNic() : null,
                    c.getUser() != null ? c.getUser().getEmail() : null,
                    phone,
                    c.getCustomerType(),
                    c.getStatus(),
                    c.getAreaCode() != null ? c.getAreaCode().getAreaCode() : null,
                    c.getAddressCity()
            );
        }).toList();
    }
    @Transactional(readOnly = true)
    public java.util.List<CashierConnectionDTO> getCustomerConnections(Integer customerId) {
        return utilityConnectionRepository.findByCustomer_UserId(customerId)
                .stream()
                .map(c -> new CashierConnectionDTO(
                        c.getConnectionId(),
                        c.getUtilityType(),
                        c.getMeterSerialNumber(),
                        c.getStatus()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public CashierBillDTO getCurrentBillByConnection(Integer connectionId) {
        Bill bill = billRepository.findFirstByConnection_ConnectionIdOrderByPeriodEndDesc(connectionId)
                .orElseThrow(() -> new RuntimeException("No bill found for connectionId: " + connectionId));

        Integer customerId = null;
        String customerName = "-";

        if (bill.getConnection() != null && bill.getConnection().getCustomer() != null) {
            customerId = bill.getConnection().getCustomer().getUserId();

            if (bill.getConnection().getCustomer().getUser() != null
                    && bill.getConnection().getCustomer().getUser().getFullName() != null) {
                customerName = bill.getConnection().getCustomer().getUser().getFullName();
            }
        }

        String utilityType = bill.getConnection() != null ? bill.getConnection().getUtilityType() : null;

        return new CashierBillDTO(
                bill.getBillId(),
                bill.getConnection().getConnectionId(),
                customerId,
                utilityType,
                customerName,
                bill.getPeriodStart(),
                bill.getPeriodEnd(),
                bill.getTotalBillAmount(),
                bill.getOutstandingAmount(),
                bill.getStatus()
        );
    }


    @Transactional(readOnly = true)
    public List<CashierBillHistoryDTO> getBillHistoryByConnection(
            Integer connectionId,
            boolean includePaid,
            String status,
            String utilityType,
            int limit
    ) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        Pageable pageable = PageRequest.of(0, safeLimit);

        List<Bill> bills;

        if (utilityType != null && !utilityType.isBlank()) {
            bills = billRepository
                    .findByConnection_ConnectionIdAndConnection_UtilityTypeOrderByPeriodEndDesc(
                            connectionId, utilityType, pageable
                    );
        }
        else if (status != null && !status.isBlank()) {
            bills = billRepository
                    .findByConnection_ConnectionIdAndStatusOrderByPeriodEndDesc(
                            connectionId, status, pageable
                    );
        }
        else if (includePaid) {
            bills = billRepository
                    .findByConnection_ConnectionIdOrderByPeriodEndDesc(
                            connectionId, pageable
                    );
        }
        else {
            bills = billRepository
                    .findByConnection_ConnectionIdAndStatusNotOrderByPeriodEndDesc(
                            connectionId, "FULLY PAID", pageable
                    );
        }

        return bills.stream()
                .map(b -> new CashierBillHistoryDTO(
                        b.getBillId(),
                        b.getConnection().getConnectionId(),
                        b.getPeriodStart(),
                        b.getPeriodEnd(),
                        b.getTotalBillAmount(),
                        b.getOutstandingAmount(),
                        b.getStatus()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CashierBillListItemDTO> getAllBills(String status, String utilityType, String customerType, int limit) {

        int safeLimit = Math.max(1, Math.min(limit, 100));
        Pageable pageable = PageRequest.of(0, safeLimit);


        List<Bill> bills = billRepository.cashierGetAllBills(
                blankToNull(status),
                blankToNull(utilityType),
                blankToNull(customerType),
                pageable
        );

        return bills.stream()
                .map(b -> new CashierBillListItemDTO(
                        b.getBillId(),
                        b.getConnection().getConnectionId(),
                        b.getConnection().getUtilityType(),
                        b.getConnection().getCustomer().getUserId(),
                        b.getConnection().getCustomer().getUser().getFullName(),
                        b.getConnection().getCustomer().getCustomerType(),
                        b.getPeriodStart(),
                        b.getPeriodEnd(),
                        b.getTotalBillAmount(),
                        b.getOutstandingAmount(),
                        b.getStatus()
                ))
                .toList();
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}