package com.example.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    // ✅ Minimum 256-bit key for HS256
    private static final SecretKey SECRET_KEY =
            Keys.hmacShaKeyFor(
                    "course_app_secret_key_course_app_secret_key"
                            .getBytes()
            );

    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000)
                )
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    // ================= PARSE & VALIDATE TOKEN =================
    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token) // signature + expiry checked here
                .getBody();
    }

    // ================= VALIDATE TOKEN =================
    public boolean validateToken(String token) {
        try {
            getClaims(token); // throws exception if invalid/expired
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // ================= EXTRACT DATA =================
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

}
