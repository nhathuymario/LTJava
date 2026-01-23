package com.example.LTJava.review.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import com.example.LTJava.review.entity.ReviewAssignment;
import com.example.LTJava.review.entity.ReviewStatus;
import org.springframework.data.repository.query.Param;

public interface ReviewAssignmentRepository extends JpaRepository<ReviewAssignment, Long> {

    List<ReviewAssignment> findByReviewer_IdOrderByDueAtAsc(Long reviewerId);

    List<ReviewAssignment> findByReviewer_IdAndStatusOrderByDueAtAsc(Long reviewerId, ReviewStatus status);

    List<ReviewAssignment> findBySyllabus_IdOrderByCreatedAtDesc(Long syllabusId);

    Optional<ReviewAssignment> findByIdAndReviewer_Id(Long id, Long reviewerId);

    Optional<ReviewAssignment> findTopBySyllabus_IdAndReviewer_IdOrderByCreatedAtDesc(Long syllabusId, Long reviewerId);


    boolean existsBySyllabus_IdAndReviewer_IdAndStatusIn(
            Long syllabusId,
            Long reviewerId,
            List<ReviewStatus> statuses
    );

    Optional<ReviewAssignment> findBySyllabus_IdAndReviewer_Id(
            Long syllabusId,
            Long reviewerId
    );

    @Query("""
SELECT a FROM ReviewAssignment a
JOIN a.syllabus s
JOIN s.course c
JOIN a.reviewer r
WHERE (:courseId IS NULL OR c.id = :courseId)
  AND (:syllabusId IS NULL OR s.id = :syllabusId)
  AND (:status IS NULL OR a.status = :status)
  AND (:reviewer IS NULL OR r.username LIKE %:reviewer%)
  AND (:fromDue IS NULL OR a.dueAt >= :fromDue)
  AND (:toDue IS NULL OR a.dueAt <= :toDue)
ORDER BY a.dueAt ASC
""")
    List<ReviewAssignment> searchForHod(
            @Param("courseId") Long courseId,
            @Param("syllabusId") Long syllabusId,
            @Param("status") ReviewStatus status,
            @Param("reviewer") String reviewer,
            @Param("fromDue") LocalDateTime fromDue,
            @Param("toDue") LocalDateTime toDue
    );

}
