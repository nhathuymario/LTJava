package com.example.LTJava.syllabus.repository;

import com.example.LTJava.syllabus.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {

    Optional<Course> findByCode(String code);
}
