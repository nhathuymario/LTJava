package com.example.LTJava.syllabuscomment.repository;

import com.example.LTJava.syllabuscomment.entity.CommentStatus;
import com.example.LTJava.syllabuscomment.entity.SyllabusComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SyllabusCommentRepository extends JpaRepository<SyllabusComment, Long> {

    List<SyllabusComment> findBySyllabus_IdAndStatusOrderByCreatedAtAsc(
            Long syllabusId,
            CommentStatus status
    );

    // ✅ comment theo assignment
    List<SyllabusComment> findByAssignment_IdAndStatusOrderByCreatedAtAsc(
            Long assignmentId,
            CommentStatus status
    );
}
