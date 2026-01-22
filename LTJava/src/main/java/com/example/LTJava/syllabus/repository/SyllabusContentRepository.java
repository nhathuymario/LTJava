package com.example.LTJava.syllabus.repository;

import com.example.LTJava.syllabus.entity.SyllabusContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SyllabusContentRepository
        extends JpaRepository<SyllabusContent, Long> {

    Optional<SyllabusContent> findBySyllabus_Id(Long syllabusId);
}
