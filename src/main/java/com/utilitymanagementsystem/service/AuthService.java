package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.LoginRequestDTO;
import com.utilitymanagementsystem.dto.LoginResponseDTO;
import com.utilitymanagementsystem.dto.PasswordSetupRequestDTO;
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
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        String storedHash = user.getPasswordHash();
        if (storedHash == null || !passwordEncoder.matches(request.getPassword(), storedHash)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        Integer userId = user.getUserId();
        String email = user.getEmail();

        List<String> roles = new ArrayList<>();
        List<String> permissions = new ArrayList<>();

        adminRepository.findByUser_UserId(userId).ifPresent(admin -> {
            roles.add("ADMIN");

            Integer roleId = admin.getRole().getRoleId();  // From admin table

            // Load permission names or IDs
            permissions.addAll(
                    permissionRepository.findPermissionNamesByRoleId(roleId)
            );
        });

        managerRepository.findByUser_UserId(userId)
                .ifPresent(m -> roles.add("MANAGER"));

        cashierRepository.findByUser_UserId(userId)
                .ifPresent(c -> roles.add("CASHIER"));

        fieldOfficerRepository.findByUser_UserId(userId)
                .ifPresent(f -> roles.add("FIELD_OFFICER"));

        String token = jwtUtil.generateToken(email);

        LoginResponseDTO response = new LoginResponseDTO(userId, email, roles);
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
