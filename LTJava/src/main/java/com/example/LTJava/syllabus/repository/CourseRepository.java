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
        SELECT c
        FROM Course c
        WHERE
            (:year IS NULL OR c.academicYear = :year)
        AND (:semester IS NULL OR c.semester = :semester)
        AND c.id NOT IN (
            SELECT s.course.id
            FROM Subscription s
            WHERE s.user.id = :userId
        )
        ORDER BY c.code ASC
    """)
    List<Course> findAvailableCoursesForStudent(
            @Param("userId") Long userId,
            @Param("year") String year,
            @Param("semester") String semester
    );


    Optional<Course> findByCode(String code);
}
