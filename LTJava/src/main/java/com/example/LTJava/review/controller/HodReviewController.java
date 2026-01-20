package com.example.LTJava.review.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.LTJava.auth.security.CustomUserDetails;
import com.example.LTJava.review.dto.AssignReviewRequest;
import com.example.LTJava.review.entity.ReviewAssignment;
import com.example.LTJava.review.service.ReviewAssignmentService;

@RestController
@RequestMapping("/api/hod/reviews")
@PreAuthorize("hasRole('HOD')")
public class HodReviewController {

    private final ReviewAssignmentService service;

    public HodReviewController(ReviewAssignmentService service) {
        this.service = service;
    }

    @PostMapping("/assign")
    public ResponseEntity<List<ReviewAssignment>> assign(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestBody AssignReviewRequest req
    ) {
        return ResponseEntity.ok(
                service.assignByUsernames(
                        currentUser.getId(),
                        req.getSyllabusId(),
                        req.getReviewerUsernames(),
                        req.getDueAt()
                )
        );
    }

    @GetMapping("/syllabus/{syllabusId}")
    public ResponseEntity<List<ReviewAssignment>> listForSyllabus(@PathVariable Long syllabusId) {
        return ResponseEntity.ok(service.listForSyllabus(syllabusId));
    }

    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<?> cancel(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long assignmentId
    ) {
        service.cancel(currentUser.getId(), assignmentId);
        return ResponseEntity.ok().build();
    }
}
