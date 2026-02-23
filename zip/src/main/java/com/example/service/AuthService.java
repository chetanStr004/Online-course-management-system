package com.example.service;

import com.example.dto.AuthResponseDTO;
import com.example.dto.UserAuthDTO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;


public interface AuthService {

    String signup(UserAuthDTO dto);

    Map<String,Object> login(UserAuthDTO dto);
}
