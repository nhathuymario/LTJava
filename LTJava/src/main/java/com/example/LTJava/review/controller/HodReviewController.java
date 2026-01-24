package com.example.LTJava.review.controller;

import java.time.LocalDateTime;
import java.util.List;

import com.example.LTJava.review.entity.ReviewStatus;
import org.springframework.format.annotation.DateTimeFormat;
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

    @GetMapping
    public List<ReviewAssignment> listAll(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long syllabusId,
            @RequestParam(required = false) ReviewStatus status,
            @RequestParam(required = false) String reviewer,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDue,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDue
    ) {
        return service.listAllForHod(courseId, syllabusId, status, reviewer, fromDue, toDue);
    }

}
