package com.example.dto;

import com.example.model.UserRole;
import lombok.Data;

@Data
public class UserAuthDTO {

    private Integer id;
    private String name;
    private String email;
    private String password;
    private UserRole role;
}
