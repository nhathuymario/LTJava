package com.example.LTJava.course.repository;

import com.example.LTJava.course.entity.Course1;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository1 extends JpaRepository<Course1, Long> {
    boolean existsByCode(String code);
    List<Course1> findByLecturerId(Long lecturerId);
    List<Course1> findByLecturerUsername(String lecturerUsername);

    @Modifying
    @Query(
            value = "delete from course_prerequisites where prerequisite_id = :id",
            nativeQuery = true
    )
    void removeFromAllPrerequisites(@Param("id") Long id);


}
