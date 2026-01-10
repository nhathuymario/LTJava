package com.example.LTJava.syllabus.repository;

import com.example.LTJava.syllabus.entity.SyllabusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SyllabusHistoryRepository extends JpaRepository<SyllabusHistory, Long> {
    // Lấy lịch sử của 1 giáo trình, sắp xếp mới nhất lên đầu
    List<SyllabusHistory> findBySyllabusIdOrderByUpdatedAtDesc(Long syllabusId);
}