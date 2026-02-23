package com.example.service;

import com.example.config.JwtUtil;
import com.example.dto.AuthResponseDTO;
import com.example.dto.UserAuthDTO;
import com.example.model.Status;
import com.example.model.User;
import com.example.repository.UserRepository;
import com.example.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // ================= SIGNUP =================
    @Override
    public String signup(UserAuthDTO dto) {

        // business rule: email must be unique
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists with this email");
        }

        User user = new User();
        user.setName(dto.getName().trim());
        user.setEmail(dto.getEmail().trim());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());
        user.setStatus(Status.ACTIVE);
        user.setCreatedDate(LocalDateTime.now());
        user.setModifiedDate(LocalDateTime.now());

        userRepository.save(user);

        return "Signup successful";
    }

    // ================= LOGIN =================
    @Override
    public Map<String, Object> login(UserAuthDTO dto) {
        Map<String, Object> response = new HashMap<>();

        try {
            User user = userRepository.findByEmail(dto.getEmail())
                    .orElseThrow(() -> new RuntimeException("Email not found"));

            if (user.getStatus() != Status.ACTIVE) {
                throw new RuntimeException("User account is not active");
            }

            if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
                throw new RuntimeException("Incorrect password");
            }

            // Generate JWT token
            String token = jwtUtil.generateToken(
                    user.getEmail(),
                    user.getRole().name()
            );

            // Build response data
            Map<String, Object> userData = new HashMap<>();
            userData.put("token", token);
            userData.put("name", user.getName());
            userData.put("email", user.getEmail());
            userData.put("role", user.getRole());

            response.put("success", true);
            response.put("message", "Login successful");
            response.put("data", userData);

        } catch (Exception ex) {
            response.put("success", false);
            response.put("message", ex.getMessage());
        }

        return response;
    }

}
