package com.example.LTJava.syllabuscomment.service;

import com.example.LTJava.syllabuscomment.dto.CommentResponse;

import java.util.List;

public interface SyllabusCommentService {

    // comment kiểu cũ: comment theo syllabus (không assignment)
    CommentResponse addComment(Long syllabusId, Long lecturerId, String content);

    // ✅ comment trong collaborative review (theo assignment)
    CommentResponse addCommentForAssignment(Long assignmentId, Long lecturerId, String content);

    List<CommentResponse> getComments(Long syllabusId);

    List<CommentResponse> getCommentsForOwner(Long syllabusId, Long lecturerId);

    // ✅ list comment theo assignment
    List<CommentResponse> getCommentsByAssignment(Long assignmentId);

    CommentResponse updateComment(Long commentId, Long lecturerId, String content);

    void deleteComment(Long commentId, Long lecturerId);
}
