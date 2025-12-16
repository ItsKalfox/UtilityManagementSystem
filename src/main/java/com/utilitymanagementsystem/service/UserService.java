package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.*;
import com.utilitymanagementsystem.exception.ResourceNotFoundException;
import com.utilitymanagementsystem.model.*;
import com.utilitymanagementsystem.repository.*;
import com.utilitymanagementsystem.spec.UserSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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

    public UserService(
            UserRepository userRepository,
            CustomerRepository customerRepository,
            AdminRepository adminRepository,
            ManagerRepository managerRepository,
            FieldOfficerRepository fieldOfficerRepository,
            CashierRepository cashierRepository,
            AdminActionLogService adminActionLogService
    ) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.adminRepository = adminRepository;
        this.managerRepository = managerRepository;
        this.fieldOfficerRepository = fieldOfficerRepository;
        this.cashierRepository = cashierRepository;
        this.adminActionLogService = adminActionLogService;
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
    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        adminActionLogService.logAction(
                "CUSTOMER",
                userId.toString(),
                "DELETE"
        );

        userRepository.delete(user);
    }
}
