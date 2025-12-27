package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.cashier.*;
import com.utilitymanagementsystem.dto.manager.*;
import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;
import com.utilitymanagementsystem.exception.ConflictException;
import com.utilitymanagementsystem.exception.EmailSendException;
import com.utilitymanagementsystem.exception.ResourceNotFoundException;
import com.utilitymanagementsystem.model.Cashier;
import com.utilitymanagementsystem.model.PhoneNumber;
import com.utilitymanagementsystem.model.User;
import com.utilitymanagementsystem.repository.CashierRepository;
import com.utilitymanagementsystem.repository.UserRepository;
import com.utilitymanagementsystem.security.PasswordGenerator;
import com.utilitymanagementsystem.spec.CashierSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Service
public class CashierService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminActionLogService adminActionLogService;
    private final CashierRepository cashierRepository;
    private final EmailService emailService;

    public CashierService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AdminActionLogService adminActionLogService,
            CashierRepository cashierRepository,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminActionLogService = adminActionLogService;
        this.cashierRepository = cashierRepository;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public Page<CashierListDTO> getCashiers(
            String search,
            String status,
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Cashier> spec =
                CashierSpecification.hasSearch(search)
                        .and(CashierSpecification.hasStatus(status));

        Page<Cashier> cashiers = cashierRepository.findAll(spec, pageable);

        return cashiers.map(c ->
                new CashierListDTO(
                        c.getUser().getUserId(),
                        c.getUser().getFullName(),
                        c.getUser().getNic(),
                        c.getBranchName(),
                        c.getStatus()
                )
        );
    }

    @Transactional(readOnly = true)
    public CashierNICCheckDTO checkCashier(@PathVariable String nic) {
        User user = userRepository.findByNic(nic).orElse(null);
        if (user == null) {
            return new CashierNICCheckDTO(false, false, null);
        }
        boolean hasCashierProfile = cashierRepository.existsByUserId(user.getUserId());
        if (hasCashierProfile) {
            return new CashierNICCheckDTO(true, true, null);
        }
        return new CashierNICCheckDTO(true, false, user.getUserId());
    }

    @Transactional(readOnly = true)
    public CashierDetailDTO getCashierDetails(Integer cashierId) {
        Cashier cashier = cashierRepository.findById(cashierId)
                .orElseThrow(() -> new ResourceNotFoundException("Cashier not found"));

        User user = cashier.getUser();

        List<PhoneNumberDTO> phones = user.getPhoneNumbers().stream()
                .map(p -> new PhoneNumberDTO(p.getPhoneNumber(), p.getNumberType()))
                .toList();

        return new CashierDetailDTO(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getNic(),
                cashier.getStatus(),
                cashier.getCreatedAt(),
                cashier.getUpdatedAt(),
                cashier.getBranchName(),
                phones
        );
    }

    @Transactional
    public CashierDetailDTO updateCashier(Integer cashierId, CashierUpdateDTO dto) {
        Cashier cashier = cashierRepository.findById(cashierId)
                .orElseThrow(() -> new ResourceNotFoundException("Cashier not found"));

        User user = cashier.getUser();

        if (dto.fullName() != null) {
            if (dto.fullName().isBlank()) {
                throw new IllegalArgumentException("fullName field cannot be blank");
            }
            user.setFullName(dto.fullName());
        }

        if (dto.email() != null) {
            if (dto.email().isBlank()) {
                throw new IllegalArgumentException("email field cannot be blank");
            }

            if (!dto.email().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
                throw new IllegalArgumentException("Invalid email format");
            }

            if (userRepository.existsByEmailAndUserIdNot(dto.email(), user.getUserId())) {
                throw new ConflictException("Email already exists");
            }
            user.setEmail(dto.email());
        }

        if (dto.nic() != null) {
            if (dto.nic().isBlank()) {
                throw new IllegalArgumentException("nic field cannot be blank");
            }

            if (!dto.nic().matches("\\d{9}[VvXx]|\\d{12}")) {
                throw new IllegalArgumentException("Invalid NIC format");
            }

            if (userRepository.existsByNicAndUserIdNot(dto.nic(), user.getUserId())) {
                throw new ConflictException("NIC already exists");
            }
            user.setNic(dto.nic());
        }

        if (dto.branchName() != null) {
            if (dto.branchName().isBlank()) {
                throw new IllegalArgumentException("branchName field cannot be blank");
            }

            cashier.setBranchName(dto.branchName());
        }

        if (dto.phoneNumbers() != null) {
            if (dto.phoneNumbers().isEmpty()) {
                throw new IllegalArgumentException("phoneNumbers list cannot be empty");
            }

            user.getPhoneNumbers().clear();

            for (PhoneNumberDTO p : dto.phoneNumbers()) {
                if (p.phoneNumber() == null || p.phoneNumber().isBlank()) {
                    throw new IllegalArgumentException("phoneNumber field cannot be blank");
                }

                if (!p.phoneNumber().matches("^\\+[1-9]\\d{7,14}$")) {
                    throw new IllegalArgumentException("Phone number must be in E.164 format");
                }

                if (p.numberType() == null) {
                    throw new IllegalArgumentException("numberType field cannot be null");
                }

                if (!p.numberType().equals("MOBILE") && !p.numberType().equals("HOME") && !p.numberType().equals("WORK")) {
                    throw new IllegalArgumentException("numberType is invalid");
                }

                PhoneNumber phone = new PhoneNumber();
                phone.setUser(user);
                phone.setPhoneNumber(p.phoneNumber());
                phone.setNumberType(p.numberType());
                user.getPhoneNumbers().add(phone);
            }
        }

        adminActionLogService.logAction(
                "CASHIER",
                cashierId.toString(),
                "UPDATE"
        );

        return getCashierDetails(cashierId);
    }

    @Transactional
    public CashierDetailDTO createCashier(CashierCreateDTO dto) {
        User user = userRepository.findById(dto.cashierId())
                .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));

        if (cashierRepository.findByUser_UserId(dto.cashierId()).isPresent()) {
            throw new ConflictException("Cashier already exists");
        }

        Cashier cashier = new Cashier();
        cashier.setPasswordHash("password");
        cashier.setStatus("INACTIVE");
        cashier.setUser(user);
        cashier.setBranchName(dto.branchName());

        cashierRepository.save(cashier);

        adminActionLogService.logAction(
                "CASHIER",
                dto.cashierId().toString(),
                "CREATE"
        );

        return getCashierDetails(dto.cashierId());
    }

    @Transactional
    public CashierDetailDTO createFullCashier(CashierCreateFullDTO dto) {
        if (!dto.email().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new IllegalArgumentException("Invalid email format");
        }

        if (userRepository.existsByEmail(dto.email())) {
            throw new ConflictException("Email already exists");
        }

        if (!dto.nic().matches("\\d{9}[VvXx]|\\d{12}")) {
            throw new IllegalArgumentException("Invalid NIC format");
        }

        if (userRepository.existsByNic(dto.nic())) {
            throw new ConflictException("NIC already exists");
        }

        User user = new User();
        user.setFullName(dto.fullName());
        user.setEmail(dto.email());
        user.setNic(dto.nic());

        userRepository.save(user);

        for (PhoneNumberDTO p : dto.phoneNumbers()) {
            if (p.phoneNumber() == null || p.phoneNumber().isBlank()) {
                throw new IllegalArgumentException("phoneNumber cannot be blank");
            }

            if (!p.phoneNumber().matches("^\\+[1-9]\\d{7,14}$")) {
                throw new IllegalArgumentException("Phone number must be in E.164 format");
            }

            if (p.numberType() == null) {
                throw new IllegalArgumentException("numberType field cannot be null");
            }

            if (!p.numberType().equals("MOBILE") && !p.numberType().equals("HOME") && !p.numberType().equals("WORK")) {
                throw new IllegalArgumentException("numberType is invalid");
            }

            PhoneNumber phone = new PhoneNumber();
            phone.setUser(user);
            phone.setPhoneNumber(p.phoneNumber());
            phone.setNumberType(p.numberType());

            user.getPhoneNumbers().add(phone);
        }

        Cashier cashier = new Cashier();
        cashier.setPasswordHash("password");
        cashier.setStatus("INACTIVE");
        cashier.setUser(user);
        cashier.setBranchName(dto.branchName());

        cashierRepository.save(cashier);

        adminActionLogService.logAction(
                "CASHIER",
                user.getUserId().toString(),
                "CREATE"
        );

        return getCashierDetails(user.getUserId());
    }

    @Transactional
    public void deleteCashier(Integer cashierId) {
        Cashier cashier = cashierRepository.findById(cashierId)
                .orElseThrow(() -> new ResourceNotFoundException("Cashier not found"));

        adminActionLogService.logAction(
                "CASHIER",
                cashierId.toString(),
                "DELETE"
        );

        cashierRepository.delete(cashier);
    }

    @Transactional
    public void resetCashierPassword(Integer userId) {

        Cashier cashier = cashierRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String rawPassword = PasswordGenerator.generate(14);
        String hashedPassword = passwordEncoder.encode(rawPassword);

        cashier.setPasswordHash(hashedPassword);
        cashierRepository.save(cashier);

        User user = cashier.getUser();

        try {
            emailService.sendPasswordResetEmail(
                    user.getEmail(),
                    user.getFullName(),
                    rawPassword
            );
        } catch (Exception e) {
            throw new EmailSendException("Failed to send password reset email");
        }

        adminActionLogService.logAction(
                "CASHIER",
                user.getUserId().toString(),
                "Cashier Password Reset"
        );
    }

    @Transactional
    public void activateCashier(Integer userId) {
        Cashier cashier = cashierRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cashier not found"));

        if (cashier.getStatus().equals("ACTIVE")) {
            throw new RuntimeException("Cashier is already Active");
        }

        cashier.setStatus("ACTIVE");
        cashierRepository.save(cashier);

        adminActionLogService.logAction(
                "CASHIER",
                cashier.getUserId().toString(),
                "Cashier Account activated"
        );
    }

    @Transactional
    public void deactivateCashier(Integer userId) {
        Cashier cashier = cashierRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cashier not found"));

        if (cashier.getStatus().equals("INACTIVE")) {
            throw new RuntimeException("Cashier is already Inactive");
        }

        cashier.setStatus("INACTIVE");
        cashierRepository.save(cashier);

        adminActionLogService.logAction(
                "CASHIER",
                cashier.getUserId().toString(),
                "Cashier Account deactivated"
        );
    }
}