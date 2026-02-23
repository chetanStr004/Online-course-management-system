package com.example.service;

import com.example.dto.StudentCourseDTO;

import java.util.List;
import java.util.Map;

public interface StudentCourseService {

    List<Map<String,Object>> getStudentCourseMapping(Integer studentId);

    Map<String,Object> saveOrUpdateCourse(StudentCourseDTO dto);
}
