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
@PreAuthorize("hasRole('LECTURER')")
public class StudentSyllabusController {

    private final SyllabusService syllabusService;

    public SyllabusController(SyllabusService syllabusService) {
        this.syllabusService = syllabusService;
    }

    // ==================================================================
    // 🌍 ROLE: STUDENT - SINH VIÊN (Đã yêu cầu Đăng nhập)
    // ==================================================================

    // 1. API Tìm kiếm nâng cao cho Student
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/search")
    public ResponseEntity<?> searchSyllabus(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String academicYear, // Thêm tham số
            @RequestParam(required = false) String semester      // Thêm tham số
    ) {
        List<Syllabus> result = syllabusService.searchSyllabus(keyword, academicYear, semester);
        return ResponseEntity.ok(result);
    }

    // 5. Xem chi tiết giáo trình
    // URL mới: /api/syllabus/student/{id}
    @PreAuthorize("hasRole('STUDENT')")  // <--- THÊM DÒNG NÀY
    @GetMapping("/student/{id}")         // <--- Đổi từ /public/{id} thành /student/{id}
    public ResponseEntity<Syllabus> viewStudentSyllabus(@PathVariable Long id) {
        return ResponseEntity.ok(syllabusService.getSyllabusDetailPublic(id));
    }
}
