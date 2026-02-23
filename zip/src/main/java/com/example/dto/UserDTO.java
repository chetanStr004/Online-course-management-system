package com.example.dto;

import com.example.model.Status;
import com.example.model.UserRole;
import lombok.Data;

@Data
public class UserDTO {

    private Integer id;
    private String name;
    private String phone;
    private String email;
    private String password;
    private UserRole role;
    private Status status;
}
