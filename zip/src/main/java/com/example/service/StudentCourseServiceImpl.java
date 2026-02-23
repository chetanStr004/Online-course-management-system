package com.example.service;

import com.example.dto.StudentCourseDTO;
import com.example.model.StudentCourse;
import com.example.repository.StudentCourseRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class StudentCourseServiceImpl implements StudentCourseService {

    @Autowired
    private StudentCourseRepository StudentCourseRepository;

    @Override
    public List<Map<String,Object>> getStudentCourseMapping(Integer studentId) {
        int id = (studentId == null) ? -1 : studentId;
        return StudentCourseRepository.findStudentCourseMapping(id);
    }

    @Override
    public Map<String,Object> saveOrUpdateCourse(StudentCourseDTO dto) {
        Map<String, Object> response = new HashMap<>();

        try {
            // DELETE: remove all courses of students
            if (dto.getFlag().equals("delete")) {
                StudentCourseRepository.deleteByStudentIn(dto.getStudentIds());
                response.put("success", true);
                response.put("message", "Student-course mapping deleted successfully");
                return response;
            }

            // CREATE / UPDATE
            StudentCourseRepository.deleteByStudentIn(dto.getStudentIds());

            List<StudentCourse> mapping = new ArrayList<>();

            for (Integer studentId : dto.getStudentIds()) {

                for (Integer courseId : dto.getCourseIds()) {

                    StudentCourse sc = new StudentCourse();
                    sc.setStudent(studentId);
                    sc.setCourse(courseId);

                    mapping.add(sc);
                }
            }
            StudentCourseRepository.saveAll(mapping);
            response.put("success", true);
            response.put("message", "Student Course mapping saved successfully");
        }
        catch (Exception ex) {

            response.put("success", false);
            response.put("message", ex.getMessage());
        }

        return response;
    }
}
