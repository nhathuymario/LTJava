package com.example.LTJava.syllabus.repository;

import com.example.LTJava.syllabus.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {

    // ✅ Courses mà user CHƯA subscribe
    @Query("""
        select c
        from Course c
        where c.id not in (
            select s.course.id
            from Subscription s
            where s.user.id = :userId
        )
    """)
    List<Course> findAvailableCoursesForStudent(@Param("userId") Long userId);


    Optional<Course> findByCode(String code);
}
