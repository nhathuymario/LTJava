package com.example.LTJava.outcome.repository;

import com.example.LTJava.outcome.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CloPloMapRepo extends JpaRepository<CloPloMap, Long> {
    List<CloPloMap> findByCloSyllabusId(Long syllabusId);
    void deleteByCloSyllabusId(Long syllabusId);
}
