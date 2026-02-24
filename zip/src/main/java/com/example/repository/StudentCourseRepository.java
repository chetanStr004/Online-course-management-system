package com.example.repository;

import com.example.model.StudentCourse;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface StudentCourseRepository extends JpaRepository<StudentCourse, Integer> {

    @Query(value = """
            SELECT
                u.id AS student_id,
                u.name,
                CAST(
                    json_agg(
                        json_build_object(
                            'id', c.id,
                            'name', c.name
                        )
                    ) AS TEXT
                ) AS courses
            FROM student_course sc
            JOIN users u ON u.id = sc.student_id
            JOIN course c ON c.id = sc.course_id
            WHERE CAST(u.role AS varchar) = 'STUDENT'
              AND (:studentId = -1 OR u.id = :studentId)
            GROUP BY u.id, u.name
            """, nativeQuery = true)
    List<Map<String, Object>> findStudentCourseMapping(
            @Param("studentId") Integer studentId);

    @Modifying
    @Transactional
    @Query(nativeQuery = true, value = "delete from student_course where student_id in :studentIds")
    void deleteByStudentIn(@Param("studentIds") List<Integer> studentIds);
}
