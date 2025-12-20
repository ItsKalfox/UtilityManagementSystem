package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.manager.*;
import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;
import com.utilitymanagementsystem.exception.ConflictException;
import com.utilitymanagementsystem.exception.EmailSendException;
import com.utilitymanagementsystem.exception.ResourceNotFoundException;
import com.utilitymanagementsystem.model.*;
import com.utilitymanagementsystem.repository.*;
import com.utilitymanagementsystem.security.PasswordGenerator;
import com.utilitymanagementsystem.spec.ManagerSpecification;
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
public class ManagerService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminActionLogService adminActionLogService;
    private final ManagerRepository managerRepository;
    private final EmailService emailService;

    public ManagerService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AdminActionLogService adminActionLogService,
            ManagerRepository managerRepository,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminActionLogService = adminActionLogService;
        this.managerRepository = managerRepository;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public Page<ManagerListDTO> getManagers(
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

        Specification<Manager> spec =
                ManagerSpecification.hasSearch(search)
                        .and(ManagerSpecification.hasStatus(status));

        Page<Manager> managers = managerRepository.findAll(spec, pageable);

        return managers.map(m ->
                new ManagerListDTO(
                        m.getUser().getUserId(),
                        m.getUser().getFullName(),
                        m.getUser().getNic(),
                        m.getDepartment(),
                        m.getStatus()
                )
        );
    }

    @Transactional(readOnly = true)
    public ManagerDetailDTO getManagerDetails(Integer managerId) {
        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        User user = manager.getUser();

        List<PhoneNumberDTO> phones = user.getPhoneNumbers().stream()
                .map(p -> new PhoneNumberDTO(p.getPhoneNumber(), p.getNumberType()))
                .toList();

//        boolean systemAccess = user.getPasswordHash() != null;

        return new ManagerDetailDTO(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getNic(),
                manager.getStatus(),
//                systemAccess,
                manager.getCreatedAt(),
                manager.getUpdatedAt(),
                manager.getDepartment(),
                phones
        );
    }

    @Transactional
    public ManagerDetailDTO updateManager(Integer managerId, ManagerUpdateDTO dto) {
        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        User user = manager.getUser();

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

//        if (dto.status() != null) {
//            if (!dto.status().equals("ACTIVE") && !dto.status().equals("INACTIVE")) {
//                throw new IllegalArgumentException("Invalid status");
//            }
//            user.setStatus(dto.status());
//        }
//
//        if (dto.password() != null) {
//            if (dto.password().isEmpty()) {
//                user.setPasswordHash(null);
//            }
//            else if (dto.password().isBlank()) {
//                throw new IllegalArgumentException("password field cannot be blank");
//            }
//            else {
//                if (!dto.password().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$")) {
//                    throw new IllegalArgumentException("Password must be 8–16 characters long and contain uppercase, lowercase, number, and special character");
//                }
//
//                user.setPasswordHash(passwordEncoder.encode(dto.password()));
//            }
//        }

        if (dto.department() != null) {
            if (dto.department().isBlank()) {
                throw new IllegalArgumentException("department field cannot be blank");
            }

            manager.setDepartment(dto.department());
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
                "MANAGER",
                managerId.toString(),
                "UPDATE"
        );

        return getManagerDetails(managerId);
    }

    @Transactional
    public ManagerDetailDTO createManager(ManagerCreateDTO dto) {
        User user = userRepository.findById(dto.managerId())
                .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));

        if (managerRepository.findByUser_UserId(dto.managerId()).isPresent()) {
            throw new ConflictException("Manager already exists");
        }

        Manager manager = new Manager();
        manager.setUser(user);
        manager.setDepartment(dto.department());
        manager.setPasswordHash("password");
        manager.setStatus("INACTIVE");

        managerRepository.save(manager);

        adminActionLogService.logAction(
                "MANAGER",
                dto.managerId().toString(),
                "CREATE"
        );

        return getManagerDetails(dto.managerId());
    }

    @Transactional
    public ManagerDetailDTO createFullManager(ManagerCreateFullDTO dto) {
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

//        if (dto.password() != null) {
//            if (dto.password().isEmpty()) {
//                user.setPasswordHash(null);
//            }
//            else if (dto.password().isBlank()) {
//                throw new IllegalArgumentException("password field cannot be blank");
//            }
//            else {
//                if (!dto.password().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$")) {
//                    throw new IllegalArgumentException(
//                            "Password must be 8–16 characters long and contain uppercase, lowercase, number, and special character"
//                    );
//                }
//
//                user.setPasswordHash(passwordEncoder.encode(dto.password()));
//            }
//        }

        user.setFullName(dto.fullName());
        user.setEmail(dto.email());
        user.setNic(dto.nic());
//        user.setStatus("ACTIVE");

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

        Manager manager = new Manager();
        manager.setUser(user);
        manager.setDepartment(dto.department());
        manager.setPasswordHash("password");
        manager.setStatus("INACTIVE");

        managerRepository.save(manager);

        adminActionLogService.logAction(
                "MANAGER",
                user.getUserId().toString(),
                "CREATE"
        );

        return getManagerDetails(user.getUserId());
    }

    @Transactional
    public void deleteManager(Integer managerId) {
        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        adminActionLogService.logAction(
                "MANAGER",
                managerId.toString(),
                "DELETE"
        );

        managerRepository.delete(manager);
    }

    @Transactional
    public void resetManagerPassword(Integer userId) {

        Manager manager = managerRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String rawPassword = PasswordGenerator.generate(14);
        String hashedPassword = passwordEncoder.encode(rawPassword);

        manager.setPasswordHash(hashedPassword);
        managerRepository.save(manager);

        User user = manager.getUser();

        try {
            emailService.sendEmail(
                    user.getEmail(),
                    "Your Password Has Been Reset",
                    """
                            Hello %s,
                            
                            Your password is:
                            
                            %s
                            
                            Utility Management System
                            """.formatted(user.getFullName(), rawPassword)
            );
        } catch (Exception e) {
            throw new EmailSendException("Failed to send password reset email");
        }

        adminActionLogService.logAction(
                "MANAGER",
                user.getUserId().toString(),
                "Manager Password Reset"
        );
    }

    @Transactional
    public void activateManager(Integer userId) {
        Manager manager = managerRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        if (manager.getStatus().equals("ACTIVE")) {
            throw new RuntimeException("Manager is already Active");
        }

        manager.setStatus("ACTIVE");
        managerRepository.save(manager);

        adminActionLogService.logAction(
                "MANAGER",
                manager.getUserId().toString(),
                "Manager Account activated"
        );
    }

    @Transactional
    public void deactivateManager(Integer userId) {
        Manager manager = managerRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        if (manager.getStatus().equals("INACTIVE")) {
            throw new RuntimeException("Manager is already Inactive");
        }

        manager.setStatus("INACTIVE");
        managerRepository.save(manager);

        adminActionLogService.logAction(
                "MANAGER",
                manager.getUserId().toString(),
                "Manager Account deactivated"
        );
    }
}