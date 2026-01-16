package com.example.LTJava.course.repository;

import com.example.LTJava.course.entity.Course1;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository1 extends JpaRepository<Course1, Long> {
    boolean existsByCode(String code);
    List<Course1> findByLecturerId(Long lecturerId);
    List<Course1> findByLecturerUsername(String lecturerUsername);
}
