package com.example.model;

import com.example.model.Course;
import com.example.model.User;
import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "student_course",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"student_id", "course_id"}
        )
)
@Data
public class StudentCourse {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "student_id", nullable = false)
    private Integer student;

    @Column(name = "course_id", nullable = false)
    private Integer course;

}
