package com.example.LTJava.syllabus.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.LTJava.auth.security.CustomUserDetails;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.service.SyllabusService;

@RestController
@RequestMapping("/api/student/syllabus")
@PreAuthorize("hasRole('STUDENT')")
public class StudentSyllabusController {

    private final SyllabusService syllabusService;

    public StudentSyllabusController(SyllabusService syllabusService) {
        this.syllabusService = syllabusService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<Syllabus>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) String semester
    ) {
        return ResponseEntity.ok(syllabusService.searchSyllabus(keyword, academicYear, semester));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Syllabus> detail(@PathVariable Long id) {
        return ResponseEntity.ok(syllabusService.getSyllabusDetailPublic(id));
    }

    @PostMapping("/subscribe/{courseId}")
    public ResponseEntity<String> subscribe(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long courseId
    ) {
        syllabusService.subscribeCourse(currentUser.getUser().getId(), courseId);
        return ResponseEntity.ok("Đăng ký nhận thông báo thành công!");
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> notifications(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(syllabusService.getMyNotifications(currentUser.getUser().getId()));
    }
}
