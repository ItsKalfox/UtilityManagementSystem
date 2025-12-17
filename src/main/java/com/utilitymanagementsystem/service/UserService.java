package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.user.*;
import com.utilitymanagementsystem.exception.ConflictException;
import com.utilitymanagementsystem.exception.ResourceNotFoundException;
import com.utilitymanagementsystem.model.*;
import com.utilitymanagementsystem.repository.*;
import com.utilitymanagementsystem.spec.UserSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final AdminRepository adminRepository;
    private final ManagerRepository managerRepository;
    private final FieldOfficerRepository fieldOfficerRepository;
    private final CashierRepository cashierRepository;
    private final AdminActionLogService adminActionLogService;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            CustomerRepository customerRepository,
            AdminRepository adminRepository,
            ManagerRepository managerRepository,
            FieldOfficerRepository fieldOfficerRepository,
            CashierRepository cashierRepository,
            AdminActionLogService adminActionLogService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.adminRepository = adminRepository;
        this.managerRepository = managerRepository;
        this.fieldOfficerRepository = fieldOfficerRepository;
        this.cashierRepository = cashierRepository;
        this.adminActionLogService = adminActionLogService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<UserListDTO> getUsers(
            String search,
            String profile,
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
        Specification<User> spec =
                UserSpecification.hasSearch(search)
                        .and(UserSpecification.hasStatus(status))
                        .and(UserSpecification.hasProfile(profile));

        Page<User> users = userRepository.findAll(spec, pageable);

        return users.map(u ->
                new UserListDTO(
                        u.getUserId(),
                        u.getFullName(),
                        u.getNic(),
                        u.getStatus()
                )
        );
    }

    @Transactional(readOnly = true)
    public UserDetailDTO getUserDetails(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<PhoneNumberDTO> phones = user.getPhoneNumbers().stream()
                .map(p -> new PhoneNumberDTO(p.getPhoneNumber(), p.getNumberType()))
                .toList();

        List<String> profiles = new ArrayList<>();

        if (customerRepository.findByUser_UserId(userId).isPresent()) {
            profiles.add("CUSTOMER");
        }

        if (adminRepository.findByUser_UserId(userId).isPresent()) {
            profiles.add("ADMIN");
        }

        if (managerRepository.findByUser_UserId(userId).isPresent()) {
            profiles.add("MANAGER");
        }

        if (fieldOfficerRepository.findByUser_UserId(userId).isPresent()) {
            profiles.add("FIELD_OFFICER");
        }

        if (cashierRepository.findByUser_UserId(userId).isPresent()) {
            profiles.add("CASHIER");
        }

        boolean systemAccess = user.getPasswordHash() != null;

        return new UserDetailDTO(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getNic(),
                user.getStatus(),
                systemAccess,
                user.getCreatedAt(),
                user.getUpdatedAt(),
                phones,
                profiles
        );
    }

    @Transactional
    public UserDetailDTO updateUser(Integer userId, UserUpdateDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));

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
                "USER",
                userId.toString(),
                "UPDATE"
        );

        return getUserDetails(userId);
    }

    @Transactional
    public UserDetailDTO createUser(UserCreateDTO dto) {
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

        return getUserDetails(user.getUserId());
    }

    @Transactional
    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        adminActionLogService.logAction(
                "USER",
                userId.toString(),
                "DELETE"
        );

        userRepository.delete(user);
    }
}
