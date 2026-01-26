package com.example.LTJava.outcome.repository;

import com.example.LTJava.outcome.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface CloPloMapRepo extends JpaRepository<CloPloMap, Long> {
    List<CloPloMap> findByClo_Syllabus_Id(Long syllabusId);

    // Derived delete may not execute join-delete reliably across providers; enforce JPQL delete
    @Modifying
    @Transactional
    @Query("delete from CloPloMap m where m.clo.syllabus.id = :syllabusId")
    void deleteAllBySyllabusId(Long syllabusId);

    Optional<CloPloMap> findByClo_IdAndPlo_Id(Long cloId, Long ploId);
}
