package com.example.dto;

import lombok.Data;

import java.util.List;

@Data
public class StudentCourseDTO {
    private String flag ;
    private List<Integer> studentIds;
    private List<Integer> courseIds;
}
