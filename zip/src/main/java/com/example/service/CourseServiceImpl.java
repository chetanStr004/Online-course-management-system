package com.example.service;

import com.example.dto.CourseDTO;
import com.example.model.Course;
import com.example.model.Status;
import com.example.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    CourseRepository courseRepository;


    @Override
    public List<Map<String,Object>> getCourses(Integer id) {

        int courseId = (id == null) ? -1 : id;
        return courseRepository.findCourses(courseId);
    }


    @Override
    public Map<String,Object> saveOrUpdateCourse(CourseDTO dto) {
        Map<String, Object> response = new HashMap<>();

        try {
            Course course;

            // UPDATE / DELETE
            if (dto.getId() != null) {
                course = courseRepository.findById(dto.getId())
                        .orElseThrow(() ->
                                new RuntimeException("Course not found with id: " + dto.getId()));
                if (dto.getStatus().equals(Status.valueOf("DELETED"))) {
                    course.setStatus(dto.getStatus());
                    courseRepository.save(course);
                    response.put("success", true);
                    response.put("message", "Course deleted successfully");
                    return response;
                }

            }

            // CREATE
            else {
                course = new Course();
                course.setCreatedDate(LocalDateTime.now());
            }

            course.setName(dto.getName().trim());
            course.setStudentLimit(dto.getStudentLimit());
            course.setType(dto.getType());
            course.setInstructorId(dto.getInstructorId());
            course.setDescription(dto.getDescription().trim());
            course.setStatus(dto.getStatus());
            course.setModifiedDate(LocalDateTime.now());

            Course saved = courseRepository.save(course);
            response.put("success", true);
            response.put("message", "Course saved successfully");
            response.put("data", saved);
        }
        catch (Exception ex) {

            response.put("success", false);
            response.put("message", ex.getMessage());
        }
        return response;
    }
}