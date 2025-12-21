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
import com.example.LTJava.syllabus.dto.RejectSyllabusRequest;

import java.util.List;

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
//để tạm check thông tin LECTURER
    @PreAuthorize("hasRole('LECTURER')")
    @GetMapping("/my")
    public List<Syllabus> mySyllabus(@AuthenticationPrincipal CustomUserDetails user) {
        return syllabusService.getMySyllabus(user.getUser().getId());
    }

    // ==========================================
    // ROLE 1: ACADEMIC AFFAIRS (AA) - CÔNG TÁC HỌC THUẬT
    // ==========================================

    // 1. Xem danh sách giáo trình cần duyệt
    @PreAuthorize("hasRole('AA')") // Hoặc 'ACADEMIC_AFFAIRS' tùy config security của nhóm
    @GetMapping("/aa/pending")
    public ResponseEntity<List<Syllabus>> getPendingSyllabus() {
        return ResponseEntity.ok(syllabusService.getPendingSyllabus());
    }

    // 2. Duyệt (Xuất bản) giáo trình
    @PreAuthorize("hasRole('AA')")
    @PatchMapping("/{id}/publish")
    public ResponseEntity<Syllabus> publishSyllabus(@PathVariable Long id) {
        return ResponseEntity.ok(syllabusService.publishSyllabus(id));
    }

    // 2. API Từ chối cho AA (Reject)
    @PreAuthorize("hasRole('AA')")
    @PatchMapping("/aa/{id}/reject")
    public ResponseEntity<?> rejectSyllabus(@PathVariable Long id, @RequestBody RejectSyllabusRequest request) {
        Syllabus syllabus = syllabusService.rejectSyllabus(id, request.getReason());
        return ResponseEntity.ok(syllabus);
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
