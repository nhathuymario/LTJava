package com.example.LTJava.syllabuscomment.controller;

import com.example.LTJava.auth.security.CustomUserDetails;
import com.example.LTJava.syllabuscomment.dto.CommentRequest;
import com.example.LTJava.syllabuscomment.dto.CommentResponse;
import com.example.LTJava.syllabuscomment.service.SyllabusCommentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@PreAuthorize("hasRole('LECTURER')")
public class SyllabusCommentController {

    private final SyllabusCommentService service;

    public SyllabusCommentController(SyllabusCommentService service) {
        this.service = service;
    }

    @PostMapping("/syllabus/{id}/comments")
    public CommentResponse add(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody CommentRequest req) {

        return service.addComment(id, user.getUser().getId(), req.getContent());
    }

    @GetMapping("/syllabus/{id}/comments")
    public List<CommentResponse> list(@PathVariable Long id) {
        return service.getComments(id);
    }

    @PutMapping("/comments/{commentId}")
    public CommentResponse update(
            @PathVariable Long commentId,
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody CommentRequest req) {

        return service.updateComment(commentId, user.getUser().getId(), req.getContent());
    }

    @DeleteMapping("/comments/{commentId}")
    public void delete(
            @PathVariable Long commentId,
            @AuthenticationPrincipal CustomUserDetails user) {

        service.deleteComment(commentId, user.getUser().getId());
    }
}
