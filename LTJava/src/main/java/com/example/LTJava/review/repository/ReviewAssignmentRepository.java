package com.example.LTJava.review.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.LTJava.review.entity.ReviewAssignment;
import com.example.LTJava.review.entity.ReviewStatus;

public interface ReviewAssignmentRepository extends JpaRepository<ReviewAssignment, Long> {

    List<ReviewAssignment> findByReviewer_IdOrderByDueAtAsc(Long reviewerId);

    List<ReviewAssignment> findByReviewer_IdAndStatusOrderByDueAtAsc(Long reviewerId, ReviewStatus status);

    List<ReviewAssignment> findBySyllabus_IdOrderByCreatedAtDesc(Long syllabusId);

    Optional<ReviewAssignment> findByIdAndReviewer_Id(Long id, Long reviewerId);

    boolean existsBySyllabus_IdAndReviewer_Id(Long syllabusId, Long reviewerId);
}
