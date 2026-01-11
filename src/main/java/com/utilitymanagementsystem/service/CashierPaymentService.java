package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.cashier.CashierPayBillRequestDTO;
import com.utilitymanagementsystem.dto.cashier.CashierPayBillResponseDTO;
import com.utilitymanagementsystem.model.Bill;
import com.utilitymanagementsystem.model.Payment;
import com.utilitymanagementsystem.repository.BillRepository;
import com.utilitymanagementsystem.repository.PaymentRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.utilitymanagementsystem.model.Cashier;
import com.utilitymanagementsystem.repository.CashierRepository;
import com.utilitymanagementsystem.model.User;
import com.utilitymanagementsystem.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;



import java.math.BigDecimal;

@Service
public class CashierPaymentService {

    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final JdbcTemplate jdbcTemplate;
    private final CashierRepository cashierRepository;
    private final UserRepository userRepository;



    public CashierPaymentService(BillRepository billRepository,
                                 PaymentRepository paymentRepository,
                                 JdbcTemplate jdbcTemplate,
                                 CashierRepository cashierRepository,
                                 UserRepository userRepository) {
        this.billRepository = billRepository;
        this.paymentRepository = paymentRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.cashierRepository = cashierRepository;
        this.userRepository = userRepository;
    }

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public CashierPayBillResponseDTO payBill(CashierPayBillRequestDTO req) {

        Bill bill = billRepository.findById(req.billId())
                .orElseThrow(() -> new RuntimeException("Bill not found: " + req.billId()));

        if ("FULLY PAID".equalsIgnoreCase(bill.getStatus())) {
            throw new RuntimeException("Bill already fully paid.");
        }

        BigDecimal amount = req.amount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Amount must be > 0");
        }




        Integer cashierId = getCurrentUserId();


        Payment payment = new Payment();
        payment.setBill(bill);
        Cashier cashier = cashierRepository.findById(cashierId)
                .orElseThrow(() -> new RuntimeException("Cashier not found: " + cashierId));

        payment.setCashier(cashier);
        payment.setPaymentMethod(req.method());
        payment.setAmount(amount);

        Payment saved = paymentRepository.save(payment);
        paymentRepository.flush();
        entityManager.refresh(bill);
        entityManager.clear();


        String method = normalizeMethod(req.method());

        if ("CASH".equals(method)) {
            if (req.cash() == null || req.cash().amountGiven() == null) {
                throw new RuntimeException("Cash.amountGiven is required for CASH payments");
            }
            BigDecimal given = req.cash().amountGiven();
            if (given.compareTo(amount) < 0) {
                throw new RuntimeException("Amount given is less than payment amount");
            }

            BigDecimal balance = given.subtract(amount);

            jdbcTemplate.update(
                    "INSERT INTO cash (payment_id, amount_given, balance) VALUES (?, ?, ?)",
                    saved.getPaymentId(), given, balance
            );
        } else if ("CARD".equals(method)) {
            if (req.card() == null) throw new RuntimeException("Card data required for CARD payments");
            jdbcTemplate.update(
                    "INSERT INTO card (payment_id, platform_name, card_type, approval_code) VALUES (?, ?, ?, ?)",
                    saved.getPaymentId(),
                    req.card().platformName(),
                    req.card().cardType(),   // CREDIT/DEBIT
                    req.card().approvalCode()
            );
        } else if ("BANK TRANSFER".equals(method)) {
            if (req.bankTransfer() == null) throw new RuntimeException("Bank transfer data required");
            jdbcTemplate.update(
                    "INSERT INTO bank_transfer (payment_id, bank_name, account_number, transaction_num) VALUES (?, ?, ?, ?)",
                    saved.getPaymentId(),
                    req.bankTransfer().bankName(),
                    req.bankTransfer().accountNumber(),
                    req.bankTransfer().transactionNum()
            );
        } else {
            throw new RuntimeException("Invalid method: " + req.method());
        }


        Bill updatedBill = billRepository.findById(req.billId()).orElseThrow();

        return new CashierPayBillResponseDTO(
                saved.getPaymentId(),
                updatedBill.getBillId(),
                saved.getAmount(),
                updatedBill.getOutstandingAmount(),
                updatedBill.getStatus()
        );
    }

    private String normalizeMethod(String method) {
        return method == null ? "" : method.trim().toUpperCase();
    }

    private Integer getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("No authentication found");
        }

        String name = auth.getName();


        try {
            return Integer.parseInt(name);
        } catch (NumberFormatException ignored) {}


        return userRepository.findByEmail(name)
                .map(User::getUserId)
                .orElseThrow(() -> new RuntimeException("User not found for email: " + name));
    }

}
