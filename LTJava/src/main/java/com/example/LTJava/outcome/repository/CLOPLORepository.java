package com.example.LTJava.outcome.repository;

import com.example.LTJava.outcome.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CLOPLORepository extends JpaRepository<CLOPLO, Long> {
    List<CLOPLO> findByClo_Syllabus_Id(Long syllabusId);
    @Modifying
    @Query("DELETE FROM CLOPLO cp WHERE cp.clo.id = :cloId") void deleteByCloId(@Param("cloId") Long cloId);

        boolean existsByCloAndPlo(CLO clo, PLO plo);

        Optional<CLOPLO> findByClo_IdAndPlo_Id(Long cloId, Long ploId);

        void deleteByClo_IdAndPlo_Id(Long cloId, Long ploId);

}
