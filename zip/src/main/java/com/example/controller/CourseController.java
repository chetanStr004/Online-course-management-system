package com.example.controller;

import com.example.dto.CourseDTO;
import com.example.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:4200")
public class CourseController {

    @Autowired
    private CourseService courseService ;



    @PostMapping("/saveCourses")
    public ResponseEntity<Map<String,Object>> saveOrUpdateCourse(
            @RequestBody CourseDTO courseDTO) {

        Map<String, Object> course = courseService.saveOrUpdateCourse(courseDTO);
        return ResponseEntity.ok(course);
    }

    @GetMapping("/getCourses")
    public ResponseEntity<List<Map<String,Object>>> getCourses(
            @RequestParam(required = false) Integer id) {

        return ResponseEntity.ok(courseService.getCourses(id));
    }
}
