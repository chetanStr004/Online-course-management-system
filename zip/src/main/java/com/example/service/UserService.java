package com.example.service;

import com.example.dto.UserDTO;

import java.util.List;
import java.util.Map;

public interface UserService {

    Map<String,Object> saveOrUpdateUser(UserDTO dto);

    List<Map<String,Object>> getUsersByType(String type);
}
