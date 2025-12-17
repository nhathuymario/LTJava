package com.example.LTJava.syllabus.controller;

import com.example.LTJava.auth.security.CustomUserDetails;
import com.example.LTJava.syllabus.dto.CreateSyllabusRequest;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.service.SyllabusService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/syllabus")
public class SyllabusController {

    private final SyllabusService syllabusService;

    public SyllabusController(SyllabusService syllabusService) {
        this.syllabusService = syllabusService;
    }

    // 👇 chỉ giảng viên mới được tạo giáo trình
    @PreAuthorize("hasRole('LECTURER')")
    @PostMapping("/create")
    public ResponseEntity<Syllabus> createSyllabus(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestBody CreateSyllabusRequest request
    ) {
        Long lecturerId = currentUser.getUser().getId();

        Syllabus created = syllabusService.createSyllabus(request, lecturerId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }


    @PreAuthorize("hasRole('LECTURER')")
    @PutMapping("/{id}/submit")
    public ResponseEntity<Syllabus> submit(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        Long lecturerId = currentUser.getUser().getId();
        Syllabus updated = syllabusService.submitSyllabus(id, lecturerId);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasRole('LECTURER')")
    @PutMapping("/{id}/resubmit")
    public ResponseEntity<Syllabus> resubmit(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        Long lecturerId = currentUser.getUser().getId();
        Syllabus updated = syllabusService.resubmitSyllabus(id, lecturerId);
        return ResponseEntity.ok(updated);
    }

}
