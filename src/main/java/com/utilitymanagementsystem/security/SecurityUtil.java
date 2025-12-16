package com.utilitymanagementsystem.security;

import com.utilitymanagementsystem.exception.ResourceNotFoundException;
import com.utilitymanagementsystem.model.Admin;
import com.utilitymanagementsystem.model.User;
import com.utilitymanagementsystem.repository.AdminRepository;
import com.utilitymanagementsystem.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtil {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;

    public SecurityUtil(UserRepository userRepository,
                        AdminRepository adminRepository) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
    }

    public String getCurrentEmail() {
        Authentication auth = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }

        return (String) auth.getPrincipal();
    }

    public Integer getCurrentUserId() {
        String email = getCurrentEmail();

        if (email == null) {
            throw new ResourceNotFoundException("Unauthenticated request");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found for token"));

        return user.getUserId();
    }

    public Admin getCurrentAdmin() {

        String email = getCurrentEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return adminRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User is not an admin"));
    }

}
