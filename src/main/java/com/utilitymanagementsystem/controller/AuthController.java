package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.LoginRequestDTO;
import com.utilitymanagementsystem.dto.LoginResponseDTO;
import com.utilitymanagementsystem.dto.PasswordSetupRequestDTO;
import com.utilitymanagementsystem.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller — returns role list to frontend.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        LoginResponseDTO response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/setup-password")
    public ResponseEntity<String> setupPassword(@RequestBody PasswordSetupRequestDTO request) {
        authService.setupPassword(request);
        return ResponseEntity.ok("Password updated successfully");
    }
}
