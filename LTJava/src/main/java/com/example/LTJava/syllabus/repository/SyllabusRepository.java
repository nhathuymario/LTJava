package com.example.LTJava.syllabus.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.SyllabusStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
    Optional<Syllabus> findByIdAndCreatedBy_Id(Long id, Long lecturerId);
    //để tạm check thông tin
    List<Syllabus> findByCreatedBy_Id(Long lecturerId);
    // Lọc theo trạng thái 
    List<Syllabus> findByStatus(SyllabusStatus status);

    List<Syllabus> findByCourseId(Long courseId);




    // 2. Cho Sinh viên: Tìm kiếm giáo trình đã PUBLISHED
    // 2. Cho Sinh viên: Tìm kiếm NÂNG CAO (Thêm năm học và học kỳ)
    // Logic: Tìm status PUBLISHED + (Keyword OR null) + (Year OR null) + (Semester OR null)
    @Query("SELECT s FROM Syllabus s WHERE s.status = 'PUBLISHED' " +
            "AND (:keyword IS NULL OR lower(s.course.name) LIKE lower(concat('%', :keyword, '%')) OR lower(s.course.code) LIKE lower(concat('%', :keyword, '%'))) " +
            "AND (:year IS NULL OR s.academicYear = :year) " +
            "AND (:semester IS NULL OR s.semester = :semester)")
    List<Syllabus> searchForStudent(
            @Param("keyword") String keyword,
            @Param("year") String year,
            @Param("semester") String semester
    );

}
