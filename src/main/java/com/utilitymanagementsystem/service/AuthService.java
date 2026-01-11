package com.utilitymanagementsystem.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.utilitymanagementsystem.dto.auth.LoginAdminResponseDTO;
import com.utilitymanagementsystem.dto.auth.LoginRequestDTO;
import com.utilitymanagementsystem.dto.auth.LoginResponseDTO;
import com.utilitymanagementsystem.dto.auth.PasswordSetupRequestDTO;
import com.utilitymanagementsystem.model.Admin;
import com.utilitymanagementsystem.model.Cashier;
import com.utilitymanagementsystem.model.Customer;
import com.utilitymanagementsystem.model.FieldOfficer;
import com.utilitymanagementsystem.model.Manager;
import com.utilitymanagementsystem.model.User;
import com.utilitymanagementsystem.repository.AdminRepository;
import com.utilitymanagementsystem.repository.CashierRepository;
import com.utilitymanagementsystem.repository.CustomerRepository;
import com.utilitymanagementsystem.repository.FieldOfficerRepository;
import com.utilitymanagementsystem.repository.ManagerRepository;
import com.utilitymanagementsystem.repository.PermissionRepository;
import com.utilitymanagementsystem.repository.UserRepository;
import com.utilitymanagementsystem.security.JwtUtil;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final AdminRepository adminRepository;
    private final ManagerRepository managerRepository;
    private final CashierRepository cashierRepository;
    private final FieldOfficerRepository fieldOfficerRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthService(UserRepository userRepository,
                       CustomerRepository customerRepository,
                       AdminRepository adminRepository,
                       ManagerRepository managerRepository,
                       CashierRepository cashierRepository,
                       FieldOfficerRepository fieldOfficerRepository,
                       PermissionRepository permissionRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.adminRepository = adminRepository;
        this.managerRepository = managerRepository;
        this.cashierRepository = cashierRepository;
        this.fieldOfficerRepository = fieldOfficerRepository;
        this.permissionRepository = permissionRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginAdminResponseDTO adminLogin(LoginRequestDTO request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        Admin admin = adminRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (Objects.equals(admin.getStatus(), "INACTIVE")) {
            throw new RuntimeException("User is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        Integer userId = user.getUserId();
        String fullName = user.getFullName();
        String email = user.getEmail();

        List<String> roles = new ArrayList<>();
        List<String> permissions = new ArrayList<>();

        String adminRoleName = null;

        Integer roleId = admin.getRole().getRoleId();
        adminRoleName = admin.getRole().getRoleName();

        permissions.addAll(permissionRepository.findPermissionNamesByRoleId(roleId));

        String token = jwtUtil.generateToken(email, roles, permissions);

        LoginAdminResponseDTO response = new LoginAdminResponseDTO(userId, fullName, email);
        response.setAdminRole(adminRoleName);
        response.setPermissions(permissions);
        response.setToken(token);

        return response;
    }

    public void setupPassword(PasswordSetupRequestDTO request) {

        switch (request.getUserType()) {
            case "ADMIN" -> {
                Admin admin = adminRepository.findByUser_UserId(request.getUserId())
                        .orElseThrow(() -> new RuntimeException("Admin not found"));

                String hashed = passwordEncoder.encode(request.getNewPassword());
                admin.setPasswordHash(hashed);

                adminRepository.save(admin);
            }

            case "CUSTOMER" -> {
                Customer customer = customerRepository.findByUser_UserId(request.getUserId())
                        .orElseThrow(() -> new RuntimeException("Customer not found"));

                String hashed = passwordEncoder.encode(request.getNewPassword());
                customer.setPasswordHash(hashed);

                customerRepository.save(customer);
            }

            case "MANAGER" -> {
                Manager manager = managerRepository.findByUser_UserId(request.getUserId())
                        .orElseThrow(() -> new RuntimeException("Manager not found"));

                String hashed = passwordEncoder.encode(request.getNewPassword());
                manager.setPasswordHash(hashed);

                managerRepository.save(manager);
            }

            case "CASHIER" -> {
                Cashier cashier = cashierRepository.findByUser_UserId(request.getUserId())
                        .orElseThrow(() -> new RuntimeException("Cashier not found"));

                String hashed = passwordEncoder.encode(request.getNewPassword());
                cashier.setPasswordHash(hashed);

                cashierRepository.save(cashier);
            }

            case "FIELD OFFICER" -> {
                FieldOfficer fieldOfficer = fieldOfficerRepository.findByUser_UserId(request.getUserId())
                        .orElseThrow(() -> new RuntimeException("FieldOfficer not found"));

                String hashed = passwordEncoder.encode(request.getNewPassword());
                fieldOfficer.setPasswordHash(hashed);

                fieldOfficerRepository.save(fieldOfficer);
            }

            default -> throw new IllegalStateException("Unknown user type");
        }
    }

    public LoginResponseDTO customerLogin(LoginRequestDTO request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        Customer customer = customerRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (Objects.equals(customer.getStatus(), "INACTIVE")) {
            throw new RuntimeException("User is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), customer.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        Integer userId = user.getUserId();
        String fullName = user.getFullName();
        String email = user.getEmail();

        List<String> roles = new ArrayList<>();
        List<String> permissions = new ArrayList<>();

        String token = jwtUtil.generateToken(email, roles, permissions);
        LoginResponseDTO response = new LoginResponseDTO(userId, fullName, email);
        response.setToken(token);

        return response;
    }

    public LoginResponseDTO managerLogin(LoginRequestDTO request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        Manager manager = managerRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (Objects.equals(manager.getStatus(), "INACTIVE")) {
            throw new RuntimeException("User is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), manager.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        Integer userId = user.getUserId();
        String fullName = user.getFullName();
        String email = user.getEmail();

        List<String> roles = new ArrayList<>();
        List<String> permissions = new ArrayList<>();

        String token = jwtUtil.generateToken(email, roles, permissions);
        LoginResponseDTO response = new LoginResponseDTO(userId, fullName, email);
        response.setToken(token);

        return response;
    }

    public LoginResponseDTO cashierLogin(LoginRequestDTO request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        Cashier cashier = cashierRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (Objects.equals(cashier.getStatus(), "INACTIVE")) {
            throw new RuntimeException("User is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), cashier.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        Integer userId = user.getUserId();
        String fullName = user.getFullName();
        String email = user.getEmail();

        List<String> roles = new ArrayList<>();
        roles.add("CASHIER");

        List<String> permissions = new ArrayList<>();

        String token = jwtUtil.generateToken(email, roles, permissions);
        LoginResponseDTO response = new LoginResponseDTO(userId, fullName, email);
        response.setToken(token);

        return response;
    }

    public LoginResponseDTO fieldOfficerLogin(LoginRequestDTO request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        FieldOfficer fieldOfficer= fieldOfficerRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (Objects.equals(fieldOfficer.getStatus(), "INACTIVE")) {
            throw new RuntimeException("User is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), fieldOfficer.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        Integer userId = user.getUserId();
        String fullName = user.getFullName();
        String email = user.getEmail();

        List<String> roles = new ArrayList<>();
        List<String> permissions = new ArrayList<>();

        String token = jwtUtil.generateToken(email, roles, permissions);
        LoginResponseDTO response = new LoginResponseDTO(userId, fullName, email);
        response.setToken(token);

        return response;
    }
}