package com.example.controller;

import com.example.dto.UserDTO;
import com.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200") // ✅ ADD THIS

public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/saveUsers")
    public ResponseEntity<Map<String,Object>> saveUser(
            @RequestBody UserDTO dto) {

        return ResponseEntity.ok(userService.saveOrUpdateUser(dto));
    }

    @GetMapping("/getUsers")
    public ResponseEntity<List<Map<String, Object>>> getUsers(
            @RequestParam(required = false) String type) {

        return ResponseEntity.ok(userService.getUsersByType(type));
    }
}
