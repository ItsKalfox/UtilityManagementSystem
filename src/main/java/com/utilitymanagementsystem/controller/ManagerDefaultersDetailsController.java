package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.manager.BillWithPaymentsDTO;
import com.utilitymanagementsystem.dto.manager.ManagerDefaulterDetailsDTO;
import com.utilitymanagementsystem.dto.manager.PaymentDTO;
import com.utilitymanagementsystem.dto.manager.UpdateCustomerStatusDTO;
import com.utilitymanagementsystem.model.Bill;
import com.utilitymanagementsystem.model.Customer;
import com.utilitymanagementsystem.model.Payment;
import com.utilitymanagementsystem.repository.CustomerRepository;
import com.utilitymanagementsystem.repository.PaymentRepository;
import com.utilitymanagementsystem.repository.ManagerBillingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/manager")
public class ManagerDefaultersDetailsController {

    private final ManagerBillingRepository managerBillingRepository;
    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;

    public ManagerDefaultersDetailsController(
            ManagerBillingRepository managerBillingRepository,
            PaymentRepository paymentRepository,
            CustomerRepository customerRepository
    ) {
        this.managerBillingRepository = managerBillingRepository;
        this.paymentRepository = paymentRepository;
        this.customerRepository = customerRepository;
    }

    @GetMapping("/defaulters/{customerId}/details")
    public ResponseEntity<ManagerDefaulterDetailsDTO> getDetails(@PathVariable Integer customerId) {
        Customer customer = customerRepository.findById(customerId).orElse(null);
        if (customer == null) return ResponseEntity.notFound().build();

        ManagerDefaulterDetailsDTO dto = new ManagerDefaulterDetailsDTO();
        dto.customerId = customer.getUserId();

        dto.fullName = customer.getUser() != null ? customer.getUser().getFullName() : null;
        dto.email = customer.getUser() != null ? customer.getUser().getEmail() : null;
        dto.nic = customer.getUser() != null ? customer.getUser().getNic() : null;

        dto.customerType = customer.getCustomerType();
        dto.status = customer.getStatus();

        if (customer.getAreaCode() != null) {
            dto.areaCode = customer.getAreaCode().getAreaCode();
            dto.areaName = customer.getAreaCode().getAreaName();
        }

        dto.addressLine1 = customer.getAddressLine1();
        dto.addressLine2 = customer.getAddressLine2();
        dto.addressCity = customer.getAddressCity();
        dto.addressPostalCode = customer.getAddressPostalCode();

        List<Bill> bills = managerBillingRepository.findBillsByCustomerId(customerId);
        dto.bills = new ArrayList<>();

        for (Bill b : bills) {
            BillWithPaymentsDTO bd = new BillWithPaymentsDTO();

            bd.billId = b.getBillId();

            if (b.getConnection() != null) {
                bd.connectionId = b.getConnection().getConnectionId();
                bd.utilityType = b.getConnection().getUtilityType();
            }

            bd.periodStart = String.valueOf(b.getPeriodStart());
            bd.periodEnd = String.valueOf(b.getPeriodEnd());

            bd.totalBillAmount = b.getTotalBillAmount();
            bd.outstandingAmount = b.getOutstandingAmount();
            bd.status = b.getStatus();

            List<Payment> pays =
                    paymentRepository.findByBill_BillIdOrderByPaymentDateDesc(b.getBillId());

            bd.payments = new ArrayList<>();

            for (Payment p : pays) {
                PaymentDTO pd = new PaymentDTO();

                pd.paymentId = p.getPaymentId();
                pd.paymentMethod = p.getPaymentMethod();
                pd.amount = p.getAmount();
                pd.paymentDate = String.valueOf(p.getPaymentDate());

                if (p.getCashier() != null) {
                    pd.cashierId = p.getCashier().getUserId();
                } else {
                    pd.cashierId = null;
                }

                bd.payments.add(pd);
            }

            dto.bills.add(bd);
        }

        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/customers/{customerId}/status")
    public ResponseEntity<?> updateCustomerStatus(
            @PathVariable Integer customerId,
            @RequestBody UpdateCustomerStatusDTO body
    ) {
        if (body == null || body.status == null) {
            return ResponseEntity.badRequest().body("status is required");
        }

        String status = body.status.trim().toUpperCase();
        if (!status.equals("ACTIVE") && !status.equals("INACTIVE")) {
            return ResponseEntity.badRequest().body("status must be ACTIVE or INACTIVE");
        }

        Customer customer = customerRepository.findById(customerId).orElse(null);
        if (customer == null) return ResponseEntity.notFound().build();

        customer.setStatus(status);
        customerRepository.save(customer);

        return ResponseEntity.ok().build();
    }
}