package com.example.dto;

import com.example.model.Status;
import com.example.model.CourseType;
import lombok.Data;

@Data
public class CourseDTO {
    public Integer id;
    public String name;
    public String description;
    public Integer studentLimit;
    public CourseType type;
    public Integer instructorId;
    public Status status;
}
