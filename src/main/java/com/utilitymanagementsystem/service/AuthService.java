package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.LoginRequestDTO;
import com.utilitymanagementsystem.dto.LoginResponseDTO;
import com.utilitymanagementsystem.dto.PasswordSetupRequestDTO;
import com.utilitymanagementsystem.dto.RoleDTO;
import com.utilitymanagementsystem.model.User;
import com.utilitymanagementsystem.repository.AdminRepository;
import com.utilitymanagementsystem.repository.CashierRepository;
import com.utilitymanagementsystem.repository.FieldOfficerRepository;
import com.utilitymanagementsystem.repository.ManagerRepository;
import com.utilitymanagementsystem.repository.UserRepository;
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
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(UserRepository userRepository,
                       AdminRepository adminRepository,
                       ManagerRepository managerRepository,
                       CashierRepository cashierRepository,
                       FieldOfficerRepository fieldOfficerRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.managerRepository = managerRepository;
        this.cashierRepository = cashierRepository;
        this.fieldOfficerRepository = fieldOfficerRepository;
        this.passwordEncoder = passwordEncoder;
    }


    public LoginResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        String storedHash = user.getPasswordHash();
        if (storedHash == null || !passwordEncoder.matches(request.getPassword(), storedHash)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        Integer userId = user.getUserId();
        String email = user.getEmail();

        List<RoleDTO> roles = new ArrayList<>();

        adminRepository.findByUser_UserId(userId)
                .ifPresent(a -> roles.add(new RoleDTO("ADMIN", userId, email)));

        managerRepository.findByUser_UserId(userId)
                .ifPresent(m -> roles.add(new RoleDTO("MANAGER", userId, email)));

        cashierRepository.findByUser_UserId(userId)
                .ifPresent(c -> roles.add(new RoleDTO("CASHIER", userId, email)));

        fieldOfficerRepository.findByUser_UserId(userId)
                .ifPresent(f -> roles.add(new RoleDTO("FIELD_OFFICER", userId, email)));

        // If you also want to return roles from the Role entity (many-to-many) you can add them here.
        // For now we only return the four specialized roles mapped to separate tables.

        return new LoginResponseDTO(userId, email, roles);
    }

    public void setupPassword(PasswordSetupRequestDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String hashed = passwordEncoder.encode(request.getNewPassword());
        user.setPasswordHash(hashed);

        userRepository.save(user);
    }
}
