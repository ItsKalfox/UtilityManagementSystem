package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.LoginRequestDTO;
import com.utilitymanagementsystem.dto.LoginResponseDTO;
import com.utilitymanagementsystem.dto.PasswordSetupRequestDTO;
import com.utilitymanagementsystem.model.Admin;
import com.utilitymanagementsystem.model.User;
import com.utilitymanagementsystem.repository.*;
import com.utilitymanagementsystem.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final ManagerRepository managerRepository;
    private final CashierRepository cashierRepository;
    private final FieldOfficerRepository fieldOfficerRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil; // <-- ADD THIS

    @Autowired
    public AuthService(UserRepository userRepository,
                       AdminRepository adminRepository,
                       ManagerRepository managerRepository,
                       CashierRepository cashierRepository,
                       FieldOfficerRepository fieldOfficerRepository,
                       PermissionRepository permissionRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {                      // <-- ADD HERE TOO
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.managerRepository = managerRepository;
        this.cashierRepository = cashierRepository;
        this.fieldOfficerRepository = fieldOfficerRepository;
        this.permissionRepository = permissionRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;                              // <-- STORE IT
    }

    public LoginResponseDTO login(LoginRequestDTO request) {

        // 1. Validate request fields (return 400 if missing)
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        // 2. Validate user existence (401)
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // 3. Validate password (401)
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        Integer userId = user.getUserId();
        String fullName = user.getFullName();
        String email = user.getEmail();

        List<String> roles = new ArrayList<>();
        List<String> permissions = new ArrayList<>();

        String adminRoleName = null;

        Admin admin = adminRepository.findByUser_UserId(userId).orElse(null);

        if (admin != null) {
            roles.add("ADMIN");

            Integer roleId = admin.getRole().getRoleId();
            adminRoleName = admin.getRole().getRoleName();

            permissions.addAll(permissionRepository.findPermissionNamesByRoleId(roleId));
        }

        if (managerRepository.findByUser_UserId(userId).isPresent()) {
            roles.add("MANAGER");
        }

        if (cashierRepository.findByUser_UserId(userId).isPresent()) {
            roles.add("CASHIER");
        }

        if (fieldOfficerRepository.findByUser_UserId(userId).isPresent()) {
            roles.add("FIELD_OFFICER");
        }

        String token = jwtUtil.generateToken(email, roles, permissions);

        LoginResponseDTO response = new LoginResponseDTO(userId, fullName, email, roles);
        response.setAdminRole(adminRoleName);
        response.setPermissions(permissions);
        response.setToken(token);

        return response;
    }

    public void setupPassword(PasswordSetupRequestDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String hashed = passwordEncoder.encode(request.getNewPassword());
        user.setPasswordHash(hashed);

        userRepository.save(user);
    }
}
