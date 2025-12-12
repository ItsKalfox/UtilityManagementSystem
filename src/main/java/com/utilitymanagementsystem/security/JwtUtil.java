package com.utilitymanagementsystem.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String SECRET_KEY;

    @Value("${jwt.expiration}")
    private long EXPIRATION;

    private Key getSignKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    // Generate JWT with email, roles, permissions
    public String generateToken(String email, List<String> roles, List<String> permissions) {
        return Jwts.builder()
                .setSubject(email)
                .claim("roles", roles)
                .claim("permissions", permissions)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract the email (subject)
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    // Validate JWT: expired? invalid? tampered?
    public void validateToken(String token) {
        try {
            extractAllClaims(token); // this will throw if token invalid

        } catch (ExpiredJwtException e) {
            throw new RuntimeException("Token expired");

        } catch (JwtException e) {   // covers SignatureException, MalformedJwtException, etc.
            throw new RuntimeException("Invalid token");

        } catch (Exception e) {
            throw new RuntimeException("Invalid token");
        }
    }

    // Extract all claims from JWT (roles, permissions, exp, sub, etc.)
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
