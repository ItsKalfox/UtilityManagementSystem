package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.customer.CustomerBillDTO;
import com.utilitymanagementsystem.model.Bill;
import com.utilitymanagementsystem.repository.BillRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerBillService {

    private final BillRepository billRepository;

    public CustomerBillService(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    public List<CustomerBillDTO> getBillsByCustomerEmail(String email) {

        List<Bill> bills = billRepository.findBillsByCustomerEmail(email);

        return bills.stream().map(bill -> {
            CustomerBillDTO dto = new CustomerBillDTO();
            dto.billId = bill.getBillId();
            dto.utilityType = bill.getConnection().getUtilityType();
            dto.periodStart = bill.getPeriodStart();
            dto.periodEnd = bill.getPeriodEnd();
            dto.totalAmount = bill.getTotalBillAmount().doubleValue();
            dto.outstandingAmount = bill.getOutstandingAmount().doubleValue();
            dto.status = bill.getStatus();
            return dto;
        }).collect(Collectors.toList());
    }
}

