package com.example.LTJava.review.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.example.LTJava.review.entity.ReviewAssignment;
import com.example.LTJava.review.entity.ReviewStatus;
import org.springframework.transaction.annotation.Transactional;

public interface ReviewAssignmentService {

    // HOD assign theo username (=cccd)
    List<ReviewAssignment> assignByUsernames(
            Long hodId,
            Long syllabusId,
            List<String> reviewerUsernames,
            LocalDateTime dueAt
    );

    List<ReviewAssignment> listForSyllabus(Long syllabusId);

    List<ReviewAssignment> myAssignments(Long reviewerId, ReviewStatus statusOrNull);

    ReviewAssignment start(Long reviewerId, Long assignmentId);

    ReviewAssignment done(Long reviewerId, Long assignmentId);

    void cancel(Long hodId, Long assignmentId);

    List<ReviewAssignment> listAllForHod(
                Long courseId,
                Long syllabusId,
                ReviewStatus status,
                String reviewer,
                LocalDateTime fromDue,
                LocalDateTime toDue
        );
    }




