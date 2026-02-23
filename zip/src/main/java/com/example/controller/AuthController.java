package com.example.controller;

import com.example.dto.AuthResponseDTO;
import com.example.dto.UserAuthDTO;
import com.example.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthService authService;


    // ================= SIGNUP =================
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserAuthDTO dto) {
        return ResponseEntity.ok(authService.signup(dto));
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<Map<String,Object>> login(@RequestBody UserAuthDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }
}
