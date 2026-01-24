package com.example.LTJava.outcome.repository;

import com.example.LTJava.outcome.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CloRepo extends JpaRepository<Clo, Long> {
    List<Clo> findBySyllabusIdOrderByCodeAsc(Long syllabusId);
    void deleteBySyllabusId(Long syllabusId);
}

