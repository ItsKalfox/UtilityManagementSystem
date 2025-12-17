package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.cashier.*;
import com.utilitymanagementsystem.dto.manager.*;
import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;
import com.utilitymanagementsystem.exception.ConflictException;
import com.utilitymanagementsystem.exception.ResourceNotFoundException;
import com.utilitymanagementsystem.model.Cashier;
import com.utilitymanagementsystem.model.Manager;
import com.utilitymanagementsystem.model.PhoneNumber;
import com.utilitymanagementsystem.model.User;
import com.utilitymanagementsystem.repository.CashierRepository;
import com.utilitymanagementsystem.repository.ManagerRepository;
import com.utilitymanagementsystem.repository.UserRepository;
import com.utilitymanagementsystem.spec.CashierSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CashierService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminActionLogService adminActionLogService;
    private final CashierRepository cashierRepository;

    public CashierService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AdminActionLogService adminActionLogService,
            CashierRepository cashierRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminActionLogService = adminActionLogService;
        this.cashierRepository = cashierRepository;
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
                        c.getUser().getStatus()
                )
        );
    }

    @Transactional(readOnly = true)
    public CashierDetailDTO getCashierDetails(Integer cashierId) {
        Cashier cashier = cashierRepository.findById(cashierId)
                .orElseThrow(() -> new ResourceNotFoundException("Cashier not found"));

        User user = cashier.getUser();

        List<PhoneNumberDTO> phones = user.getPhoneNumbers().stream()
                .map(p -> new PhoneNumberDTO(p.getPhoneNumber(), p.getNumberType()))
                .toList();

        boolean systemAccess = user.getPasswordHash() != null;

        return new CashierDetailDTO(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getNic(),
                user.getStatus(),
                systemAccess,
                user.getCreatedAt(),
                user.getUpdatedAt(),
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

        if (dto.status() != null) {
            if (!dto.status().equals("ACTIVE") && !dto.status().equals("INACTIVE")) {
                throw new IllegalArgumentException("Invalid status");
            }
            user.setStatus(dto.status());
        }

        if (dto.password() != null) {
            if (dto.password().isEmpty()) {
                user.setPasswordHash(null);
            }
            else if (dto.password().isBlank()) {
                throw new IllegalArgumentException("password field cannot be blank");
            }
            else {
                if (!dto.password().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$")) {
                    throw new IllegalArgumentException("Password must be 8–16 characters long and contain uppercase, lowercase, number, and special character");
                }

                user.setPasswordHash(passwordEncoder.encode(dto.password()));
            }
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

        if (dto.password() != null) {
            if (dto.password().isEmpty()) {
                user.setPasswordHash(null);
            }
            else if (dto.password().isBlank()) {
                throw new IllegalArgumentException("password field cannot be blank");
            }
            else {
                if (!dto.password().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$")) {
                    throw new IllegalArgumentException(
                            "Password must be 8–16 characters long and contain uppercase, lowercase, number, and special character"
                    );
                }

                user.setPasswordHash(passwordEncoder.encode(dto.password()));
            }
        }

        user.setFullName(dto.fullName());
        user.setEmail(dto.email());
        user.setNic(dto.nic());
        user.setStatus("ACTIVE");

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
}