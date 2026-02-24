package com.example.service;

import com.example.dto.UserDTO;
import com.example.model.Status;
import com.example.model.User;
import com.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public Map<String, Object> saveOrUpdateUser(UserDTO dto) {
        Map<String, Object> response = new HashMap<>();

        try {
            User user;

            // update & delete
            if (dto.getId() != null) {
                user = userRepository.findById(dto.getId())
                        .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getId()));
                if (dto.getStatus().equals(Status.valueOf("DELETED"))) {
                    user.setStatus(dto.getStatus());
                    userRepository.save(user);
                    response.put("success", true);
                    response.put("message", "User deleted successfully");
                    return response;
                }

            }

            // create
            else {
                user = new User();
                user.setCreatedDate(LocalDateTime.now());
            }

            user.setPhone(dto.getPhone().trim());
            user.setName(dto.getName().trim());
            user.setRole(dto.getRole());
            user.setEmail(dto.getEmail().trim());

            // Protect against empty password updates
            if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode(dto.getPassword().trim()));
            }

            // Protect against status loss
            if (dto.getStatus() != null) {
                user.setStatus(dto.getStatus());
            } else if (user.getStatus() == null) {
                user.setStatus(Status.ACTIVE);
            }

            user.setModifiedDate(LocalDateTime.now());

            User saved = userRepository.save(user);
            response.put("success", true);
            response.put("message", "User saved successfully");
            response.put("data", saved);
        } catch (Exception ex) {

            response.put("success", false);
            response.put("message", ex.getMessage());
        }

        return response;
    }

    @Override
    public List<Map<String, Object>> getUsersByType(String type) {

        String role = (type == null || type.isBlank())
                ? "ALL"
                : type.toUpperCase();

        return userRepository.findUsersByRole(role);
    }

}
