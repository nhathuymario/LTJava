package com.example.LTJava.syllabus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.LTJava.auth.security.CustomUserDetails;
import com.example.LTJava.syllabus.dto.CreateSyllabusRequest;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.SyllabusStatus;
import com.example.LTJava.syllabus.service.SyllabusService;

@RestController
@RequestMapping("/api/syllabus")
public class SyllabusController {

    private final SyllabusService syllabusService;

    public SyllabusController(SyllabusService syllabusService) {
        this.syllabusService = syllabusService;
    }

    // Lecturer tạo syllabus => luôn DRAFT
    @PreAuthorize("hasRole('LECTURER')")
    @PostMapping
    public ResponseEntity<Syllabus> create(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestBody CreateSyllabusRequest request
    ) {
        Long lecturerId = currentUser.getUser().getId();
        Syllabus created = syllabusService.createSyllabus(request, lecturerId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // Lecturer submit: DRAFT -> SUBMITTED
    @PreAuthorize("hasRole('LECTURER')")
    @PutMapping("/{id}/submit")
    public ResponseEntity<Syllabus> submit(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        Long lecturerId = currentUser.getUser().getId();
        return ResponseEntity.ok(syllabusService.submitSyllabus(id, lecturerId));
    }

    // Lecturer resubmit: REQUESTEDIT/REJECTED -> SUBMITTED
    @PreAuthorize("hasRole('LECTURER')")
    @PutMapping("/{id}/resubmit")
    public ResponseEntity<Syllabus> resubmit(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        Long lecturerId = currentUser.getUser().getId();
        return ResponseEntity.ok(syllabusService.resubmitSyllabus(id, lecturerId));
    }

    // Lecturer xem syllabus của mình
    @PreAuthorize("hasRole('LECTURER')")
    @GetMapping("/my")
    public List<Syllabus> mySyllabus(@AuthenticationPrincipal CustomUserDetails user) {
        return syllabusService.getMySyllabus(user.getUser().getId());
    }

    // Lecturer xem syllabus theo course
    @PreAuthorize("hasRole('LECTURER')")
    @GetMapping("/course/{courseId}")
    public List<Syllabus> getByCourse(@PathVariable Long courseId) {
        return syllabusService.getByCourseId(courseId);
    }

    // Lecturer xem chi tiết (có thể siết lại: chỉ owner mới xem)
    @PreAuthorize("hasRole('LECTURER')")
    @GetMapping("/{id}")
    public Syllabus getById(@PathVariable Long id) {
        return syllabusService.getById(id);
    }

    // (Optional) Lecturer lọc theo status - nếu muốn giữ
    @PreAuthorize("hasRole('LECTURER')")
    @GetMapping("/status/{status}")
    public List<Syllabus> getByStatus(@PathVariable SyllabusStatus status) {
        return syllabusService.getByStatus(status);
    }

    // ❌ getAll: thường không nên cho LECTURER xem toàn hệ thống
    // Nếu cần thì chuyển quyền ADMIN hoặc bỏ hẳn.
    /*
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @GetMapping
    public List<Syllabus> getAll() {
        return syllabusService.getAll();
    }
    */
}
