package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.admin.*;
import com.utilitymanagementsystem.dto.fieldofficer.*;
import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;
import com.utilitymanagementsystem.exception.ConflictException;
import com.utilitymanagementsystem.exception.EmailSendException;
import com.utilitymanagementsystem.exception.ResourceNotFoundException;
import com.utilitymanagementsystem.model.*;
import com.utilitymanagementsystem.repository.*;
import com.utilitymanagementsystem.security.PasswordGenerator;
import com.utilitymanagementsystem.spec.AdminSpecification;
import com.utilitymanagementsystem.spec.FieldOfficerSpecification;
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
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminActionLogService adminActionLogService;
    private final AdminRepository adminRepository;
    private final RoleRepository roleRepository;
    private final EmailService emailService;

    public AdminService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AdminActionLogService adminActionLogService,
            AdminRepository adminRepository,
            RoleRepository roleRepository,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminActionLogService = adminActionLogService;
        this.adminRepository = adminRepository;
        this.roleRepository = roleRepository;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public Page<AdminListDTO> getAdmin(
            String search,
            String status,
            Integer roleId,
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Admin> spec =
                AdminSpecification.hasSearch(search)
                        .and(AdminSpecification.hasStatus(status)
                        .and(AdminSpecification.hasRoleId(roleId)));

        Page<Admin> admins = adminRepository.findAll(spec, pageable);

        return admins.map(a ->
                new AdminListDTO(
                        a.getUser().getUserId(),
                        a.getUser().getFullName(),
                        a.getUser().getNic(),
                        a.getRole().getRoleName(),
                        a.getStatus()
                )
        );
    }

    @Transactional(readOnly = true)
    public AdminNICCheckDTO checkAdmin(@PathVariable String nic) {
        User user = userRepository.findByNic(nic).orElse(null);
        if (user == null) {
            return new AdminNICCheckDTO(false, false, null);
        }
        boolean hasAdminProfile = adminRepository.existsByUserId(user.getUserId());
        if (hasAdminProfile) {
            return new AdminNICCheckDTO(true, true, null);
        }
        return new AdminNICCheckDTO(true, false, user.getUserId());
    }

    @Transactional(readOnly = true)
    public AdminDetailDTO getAdminDetails(Integer adminId) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        User user = admin.getUser();

        List<PhoneNumberDTO> phones = user.getPhoneNumbers().stream()
                .map(p -> new PhoneNumberDTO(p.getPhoneNumber(), p.getNumberType()))
                .toList();

//        boolean systemAccess = user.getPasswordHash() != null;

        return new AdminDetailDTO(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getNic(),
                admin.getStatus(),
                admin.getCreatedAt(),
                admin.getUpdatedAt(),
                admin.getRole().getRoleId(),
                phones
        );
    }

    @Transactional
    public AdminDetailDTO updateAdmin(Integer adminId, AdminUpdateDTO dto) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        User user = admin.getUser();

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

        if (dto.roleId() != null) {
            Role role = roleRepository.findById(dto.roleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role id does not exist"));

            admin.setRole(role);
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
                "ADMIN",
                adminId.toString(),
                "UPDATE"
        );  

        return getAdminDetails(adminId);
    }

    @Transactional
    public AdminDetailDTO createAdmin(AdminCreateDTO dto) {
        User user = userRepository.findById(dto.adminId())
                .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));

        if (adminRepository.findByUser_UserId(dto.adminId()).isPresent()) {
            throw new ConflictException("Admin already exists");
        }

        Role role = roleRepository.findById(dto.roleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role id does not exist"));

        Admin admin = new Admin();
        admin.setUser(user);
        admin.setRole(role);
        admin.setPasswordHash("password");
        admin.setStatus("INACTIVE");
        adminRepository.save(admin);

        adminActionLogService.logAction(
                "ADMIN",
                dto.adminId().toString(),
                "CREATE"
        );

        return getAdminDetails(dto.adminId());
    }

    @Transactional
    public AdminDetailDTO createFullAdmin(AdminCreateFullDTO dto) {
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

        Role role = roleRepository.findById(dto.roleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role id does not exist"));

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

        Admin admin = new Admin();
        admin.setUser(user);
        admin.setRole(role);
        admin.setPasswordHash("password");
        admin.setStatus("INACTIVE");
        adminRepository.save(admin);

        adminActionLogService.logAction(
                "ADMIN",
                user.getUserId().toString(),
                "CREATE"
        );

        return getAdminDetails(user.getUserId());
    }

    @Transactional
    public void deleteAdmin(Integer adminId) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        adminActionLogService.logAction(
                "ADMIN",
                adminId.toString(),
                "DELETE"
        );

        adminRepository.delete(admin);
    }

    @Transactional
    public void resetAdminPassword(Integer userId) {

        Admin admin = adminRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String rawPassword = PasswordGenerator.generate(14);
        String hashedPassword = passwordEncoder.encode(rawPassword);

        admin.setPasswordHash(hashedPassword);
        adminRepository.save(admin);

        User user = admin.getUser();

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
                "ADMIN",
                user.getUserId().toString(),
                "Admin Password Reset"
        );
    }

    @Transactional
    public void activateAdmin(Integer userId) {
        Admin admin = adminRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getStatus().equals("ACTIVE")) {
            throw new RuntimeException("Admin is already Active");
        }

        admin.setStatus("ACTIVE");
        adminRepository.save(admin);
        adminActionLogService.logAction(
                "ADMIN",
                admin.getUserId().toString(),
                "Admin Account activated"
        );
    }

    @Transactional
    public void deactivateAdmin(Integer userId) {
        Admin admin = adminRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getStatus().equals("INACTIVE")) {
            throw new RuntimeException("Admin is already Inactive");
        }

        admin.setStatus("INACTIVE");
        adminRepository.save(admin);
        adminActionLogService.logAction(
                "ADMIN",
                admin.getUserId().toString(),
                "Admin Account deactivated"
        );
    }
}