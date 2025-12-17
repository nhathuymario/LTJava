package com.example.LTJava.syllabus.repository;

import com.example.LTJava.syllabus.entity.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
    Optional<Syllabus> findByIdAndCreatedBy_Id(Long id, Long lecturerId);
}
