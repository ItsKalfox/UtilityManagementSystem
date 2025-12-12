package com.utilitymanagementsystem.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.utilitymanagementsystem.exception.ApiError;
import io.jsonwebtoken.Claims;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtFilter implements Filter {

    @Autowired
    private JwtUtil jwtUtil;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String authHeader = request.getHeader("Authorization");

        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {

                String token = authHeader.substring(7);

                // VALIDATE TOKEN (may throw runtime exception)
                jwtUtil.validateToken(token);

                // Extract all claims
                Claims claims = jwtUtil.extractAllClaims(token);

                String email = claims.getSubject(); // user email

                // extract roles and permissions
                List<String> roles = claims.get("roles", List.class);
                List<String> permissions = claims.get("permissions", List.class);

                // Convert permissions into GrantedAuthority objects
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();

                if (permissions != null) {
                    for (String p : permissions) {
                        authorities.add(new SimpleGrantedAuthority(p));
                    }
                }

                // You may also add roles as authorities, optional:
                if (roles != null) {
                    for (String r : roles) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + r));
                    }
                }

                // Set authentication context
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(email, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

            chain.doFilter(req, res);

        } catch (RuntimeException ex) {

            // Build JSON error message
            ApiError error = new ApiError(401, ex.getMessage());

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");

            response.getWriter().write(objectMapper.writeValueAsString(error));
        }
    }
}
