package com.example.LTJava.syllabuscomment.repository;

import com.example.LTJava.syllabuscomment.entity.SyllabusComment;
import com.example.LTJava.syllabuscomment.entity.CommentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SyllabusCommentRepository extends JpaRepository<SyllabusComment, Long> {

    List<SyllabusComment> findBySyllabus_IdAndStatusOrderByCreatedAtAsc(
            Long syllabusId,
            CommentStatus status
    );
}
