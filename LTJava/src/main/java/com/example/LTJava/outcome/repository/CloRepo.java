package com.example.LTJava.outcome.repository;

import com.example.LTJava.outcome.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CloRepo extends JpaRepository<Clo, Long> {
    List<Clo> findBySyllabus_IdOrderByCodeAsc(Long syllabusId);
    void deleteBySyllabus_Id(Long syllabusId);
    List<Clo> findBySyllabus_Id(Long syllabusId);
    java.util.Optional<Clo> findBySyllabus_IdAndCode(Long syllabusId, String code);
}

