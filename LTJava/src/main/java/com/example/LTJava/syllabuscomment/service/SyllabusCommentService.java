package com.example.LTJava.syllabuscomment.service;

import com.example.LTJava.syllabuscomment.dto.CommentResponse;

import java.util.List;

public interface SyllabusCommentService {
    CommentResponse addComment(Long syllabusId, Long lecturerId, String content);
    List<CommentResponse> getComments(Long syllabusId);
    CommentResponse updateComment(Long commentId, Long lecturerId, String content);
    void deleteComment(Long commentId, Long lecturerId);
}
