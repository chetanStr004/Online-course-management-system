package com.example.controller;

import com.example.dto.StudentCourseDTO;
import com.example.service.StudentCourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student-course")
@CrossOrigin(origins = { "http://localhost:4200", "https://ocm-system.vercel.app" })

public class StudentCourseController {

    @Autowired
    private StudentCourseService service;

    // CREATE / UPDATE / DELETE
    @PostMapping("/saveSC")
    public ResponseEntity<Map<String, Object>> saveOrUpdateCourse(@RequestBody StudentCourseDTO dto) {

        return ResponseEntity.ok(
                service.saveOrUpdateCourse(dto));
    }

    // GET ALL OR BY STUDENT ID
    @GetMapping("/getSC")
    public ResponseEntity<List<Map<String, Object>>> getStudentCourseMapping(
            @RequestParam(required = false) Integer studentId) {

        return ResponseEntity.ok(service.getStudentCourseMapping(studentId));
    }
}
