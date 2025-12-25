package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.fieldofficer.*;
import com.utilitymanagementsystem.dto.manager.*;
import com.utilitymanagementsystem.dto.user.PhoneNumberDTO;
import com.utilitymanagementsystem.exception.ConflictException;
import com.utilitymanagementsystem.exception.EmailSendException;
import com.utilitymanagementsystem.exception.ResourceNotFoundException;
import com.utilitymanagementsystem.model.*;
import com.utilitymanagementsystem.repository.AreaRepository;
import com.utilitymanagementsystem.repository.FieldOfficerRepository;
import com.utilitymanagementsystem.repository.ManagerRepository;
import com.utilitymanagementsystem.repository.UserRepository;
import com.utilitymanagementsystem.security.PasswordGenerator;
import com.utilitymanagementsystem.spec.FieldOfficerSpecification;
import com.utilitymanagementsystem.spec.ManagerSpecification;
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
public class FieldOfficerService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminActionLogService adminActionLogService;
    private final FieldOfficerRepository fieldOfficerRepository;
    private final AreaRepository areaRepository;
    private final EmailService emailService;

    public FieldOfficerService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AdminActionLogService adminActionLogService,
            FieldOfficerRepository fieldOfficerRepository,
            AreaRepository areaRepository,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminActionLogService = adminActionLogService;
        this.fieldOfficerRepository = fieldOfficerRepository;
        this.areaRepository = areaRepository;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public Page<FieldOfficerListDTO> getFieldOfficers(
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

        Specification<FieldOfficer> spec =
                FieldOfficerSpecification.hasSearch(search)
                        .and(FieldOfficerSpecification.hasStatus(status));

        Page<FieldOfficer> fieldOfficers = fieldOfficerRepository.findAll(spec, pageable);

        return fieldOfficers.map(f ->
                new FieldOfficerListDTO(
                        f.getUser().getUserId(),
                        f.getUser().getFullName(),
                        f.getUser().getNic(),
                        f.getAreaCode().getAreaCode(),
                        f.getStatus()
                )
        );
    }

    @Transactional(readOnly = true)
    public FieldOfficerNICCheckDTO checkFieldOfficer(@PathVariable String nic) {
        User user = userRepository.findByNic(nic).orElse(null);
        if (user == null) {
            return new FieldOfficerNICCheckDTO(false, false, null);
        }
        boolean hasFieldOfficerProfile = fieldOfficerRepository.existsByUserId(user.getUserId());
        if (hasFieldOfficerProfile) {
            return new FieldOfficerNICCheckDTO(true, true, null);
        }
        return new FieldOfficerNICCheckDTO(true, false, user.getUserId());
    }

    @Transactional(readOnly = true)
    public FieldOfficerDetailDTO getFieldOfficerDetails(Integer fieldOfficerId) {
        FieldOfficer fieldOfficer = fieldOfficerRepository.findById(fieldOfficerId)
                .orElseThrow(() -> new ResourceNotFoundException("Field Officer not found"));

        User user = fieldOfficer.getUser();

        List<PhoneNumberDTO> phones = user.getPhoneNumbers().stream()
                .map(p -> new PhoneNumberDTO(p.getPhoneNumber(), p.getNumberType()))
                .toList();

//        boolean systemAccess = user.getPasswordHash() != null;

        return new FieldOfficerDetailDTO(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getNic(),
                fieldOfficer.getStatus(),
                fieldOfficer.getCreatedAt(),
                fieldOfficer.getUpdatedAt(),
                fieldOfficer.getAreaCode().getAreaCode(),
                phones
        );
    }

    @Transactional
    public FieldOfficerDetailDTO updateFieldOfficer(Integer fieldOfficerId, FieldOfficerUpdateDTO dto) {
        FieldOfficer fieldOfficer = fieldOfficerRepository.findById(fieldOfficerId)
                .orElseThrow(() -> new ResourceNotFoundException("FieldOfficer not found"));

        User user = fieldOfficer.getUser();

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

        if (dto.areaCode() != null) {
            if (dto.areaCode().isBlank()) {
                throw new IllegalArgumentException("areaCode field cannot be blank");
            }

            Area area = areaRepository.findById(dto.areaCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Area code does not exist"));

            fieldOfficer.setAreaCode(area);
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
                "FIELD OFFICER",
                fieldOfficerId.toString(),
                "UPDATE"
        );

        return getFieldOfficerDetails(fieldOfficerId);
    }

    @Transactional
    public FieldOfficerDetailDTO createFieldOfficer(FieldOfficerCreateDTO dto) {
        User user = userRepository.findById(dto.fieldOfficerId())
                .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));

        if (fieldOfficerRepository.findByUser_UserId(dto.fieldOfficerId()).isPresent()) {
            throw new ConflictException("Field Officer already exists");
        }

        Area area = areaRepository.findById(dto.areaCode())
                .orElseThrow(() -> new ResourceNotFoundException("Area code does not exist"));

        FieldOfficer fieldOfficer= new FieldOfficer();
        fieldOfficer.setUser(user);
        fieldOfficer.setAreaCode(area);
        fieldOfficer.setPasswordHash("password");
        fieldOfficer.setStatus("INACTIVE");

        fieldOfficerRepository.save(fieldOfficer);

        adminActionLogService.logAction(
                "FIELD OFFICER",
                dto.fieldOfficerId().toString(),
                "CREATE"
        );

        return getFieldOfficerDetails(dto.fieldOfficerId());
    }

    @Transactional
    public FieldOfficerDetailDTO createFullFieldOfficer(FieldOfficerCreateFullDTO dto) {
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

        Area area = areaRepository.findById(dto.areaCode())
                .orElseThrow(() -> new ResourceNotFoundException("Area code does not exist"));

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

        FieldOfficer fieldOfficer = new FieldOfficer();
        fieldOfficer.setUser(user);
        fieldOfficer.setAreaCode(area);
        fieldOfficer.setPasswordHash("password");
        fieldOfficer.setStatus("INACTIVE");

        fieldOfficerRepository.save(fieldOfficer);

        adminActionLogService.logAction(
                "FIELD OFFICER",
                user.getUserId().toString(),
                "CREATE"
        );

        return getFieldOfficerDetails(user.getUserId());
    }

    @Transactional
    public void deleteFieldOfficer(Integer fieldOfficerId) {
        FieldOfficer fieldOfficer = fieldOfficerRepository.findById(fieldOfficerId)
                .orElseThrow(() -> new ResourceNotFoundException("Field officer not found"));

        adminActionLogService.logAction(
                "FIELD OFFICER",
                fieldOfficerId.toString(),
                "DELETE"
        );

        fieldOfficerRepository.delete(fieldOfficer);
    }

    @Transactional
    public void resetFieldOfficerPassword(Integer userId) {

        FieldOfficer fieldOfficer = fieldOfficerRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String rawPassword = PasswordGenerator.generate(14);
        String hashedPassword = passwordEncoder.encode(rawPassword);

        fieldOfficer.setPasswordHash(hashedPassword);
        fieldOfficerRepository.save(fieldOfficer);

        User user = fieldOfficer.getUser();

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
                "FIELD OFFICER",
                user.getUserId().toString(),
                "Field Officer Password Reset"
        );
    }

    @Transactional
    public void activateFieldOfficer(Integer userId) {
        FieldOfficer fieldOfficer = fieldOfficerRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Field Officer not found"));

        if (fieldOfficer.getStatus().equals("ACTIVE")) {
            throw new RuntimeException("Field officer is already Active");
        }

        fieldOfficer.setStatus("ACTIVE");
        fieldOfficerRepository.save(fieldOfficer);

        adminActionLogService.logAction(
                "FIELD OFFICER",
                fieldOfficer.getUserId().toString(),
                "Field Officer Account activated"
        );
    }

    @Transactional
    public void deactivateFieldOfficer(Integer userId) {
        FieldOfficer fieldOfficer = fieldOfficerRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Field officer not found"));

        if (fieldOfficer.getStatus().equals("INACTIVE")) {
            throw new RuntimeException("Field officer is already Inactive");
        }

        fieldOfficer.setStatus("INACTIVE");
        fieldOfficerRepository.save(fieldOfficer);

        adminActionLogService.logAction(
                "FIELD OFFICER",
                fieldOfficer.getUserId().toString(),
                "Field Officer Account deactivated"
        );
    }
}