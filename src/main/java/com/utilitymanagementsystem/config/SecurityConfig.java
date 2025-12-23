package com.utilitymanagementsystem.config;

import com.utilitymanagementsystem.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth
                        // ✅ STATIC FRONTEND FILES
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/temp.php",
                                "/*.html",
                                "/css/**",
                                "/js/**",
                                "/login/**",
                                "/admin/**",
                                "/images/**",
                                "/favicon.ico"
                        ).permitAll()

                        // ✅ AUTH APIs
                        .requestMatchers(
                                "/api/auth/setup-password",
                                "/api/auth/admin/login",
                                "/api/auth/customer/login",
                                "/api/auth/manager/login",
                                "/api/auth/cashier/login",
                                "/api/auth/field-officer/login"
                        ).permitAll()

                        // 🔒 EVERYTHING ELSE NEEDS JWT
                        .anyRequest().authenticated()
                )

                // ✅ JWT FILTER
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)

                // ❌ Disable defaults
                .httpBasic(basic -> basic.disable())
                .formLogin(login -> login.disable());

        return http.build();
    }
}
