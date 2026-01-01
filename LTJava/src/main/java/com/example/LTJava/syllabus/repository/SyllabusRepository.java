package com.example.LTJava.syllabus.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.SyllabusStatus;

public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
    Optional<Syllabus> findByIdAndCreatedBy_Id(Long id, Long lecturerId);
    //để tạm check thông tin
    List<Syllabus> findByCreatedBy_Id(Long lecturerId);

    // Lọc theo trạng thái 
    List<Syllabus> findByStatus(SyllabusStatus status);
}
