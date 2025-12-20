package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.auth.*;
import com.utilitymanagementsystem.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/admin/login")
    public ResponseEntity<LoginAdminResponseDTO> adminLogin(@RequestBody LoginRequestDTO loginRequest) {
        LoginAdminResponseDTO response = authService.adminLogin(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/customer/login")
    public ResponseEntity<LoginResponseDTO> customerLogin(@RequestBody LoginRequestDTO loginRequest) {
        LoginResponseDTO response = authService.customerLogin(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/manager/login")
    public ResponseEntity<LoginResponseDTO> managerLogin(@RequestBody LoginRequestDTO loginRequest) {
        LoginResponseDTO response = authService.managerLogin(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/cashier/login")
    public ResponseEntity<LoginResponseDTO> cashierLogin(@RequestBody LoginRequestDTO loginRequest) {
        LoginResponseDTO response = authService.cashierLogin(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/field-officer/login")
    public ResponseEntity<LoginResponseDTO> fieldOfficerLogin(@RequestBody LoginRequestDTO loginRequest) {
        LoginResponseDTO response = authService.fieldOfficerLogin(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/setup-password")
    public ResponseEntity<String> setupPassword(@RequestBody PasswordSetupRequestDTO request) {
        authService.setupPassword(request);
        return ResponseEntity.ok("Password updated successfully");
    }
}
