package com.example.dto;

import com.example.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String name;
    private String email;
    private UserRole role;
}
