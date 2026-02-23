package com.example.service;

import com.example.dto.CourseDTO;

import java.util.List;
import java.util.Map;

public interface CourseService {

    Map<String,Object> saveOrUpdateCourse(CourseDTO courseDTO);

    List<Map<String,Object>> getCourses(Integer id);

}
