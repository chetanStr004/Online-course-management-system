package com.example.repository;

import com.example.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {

    @Query(nativeQuery = true, value = "SELECT * FROM course as c WHERE CAST(c.status AS varchar) != 'DELETED' AND (:id = -1 OR c.id = :id); ")
    List<Map<String, Object>> findCourses(@Param("id") int id);
}
