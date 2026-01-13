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

    public StudentSyllabusController(SyllabusService syllabusService) {
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

    // 3. So sánh 2 năm học (Dành cho Sinh viên - Dựa trên logic search)
    // Sinh viên chọn 2 môn học ID khác nhau để so sánh
    @GetMapping("/student/compare")
    public ResponseEntity<?> compareTwoSyllabus(
            @RequestParam Long id1,
            @RequestParam Long id2) {

        // Logic so sánh 2 Syllabus entity khác nhau (viết thêm trong Service tương tự hàm compareVersions ở trên)
        // Đây là bài tập nhỏ cho bạn: Copy logic compareVersions nhưng đổi tham số thành (Syllabus s1, Syllabus s2)
        return ResponseEntity.ok("Chức năng đang phát triển: So sánh ID " + id1 + " và " + id2);
    }

    // 1. Sinh viên đăng ký theo dõi môn học
    // Postman: POST /api/syllabus/student/subscribe/1 (1 là ID môn học Course, ko phải Syllabus nhé)
    @PostMapping("/student/subscribe/{courseId}")
    public ResponseEntity<?> subscribe(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long courseId) {

        syllabusService.subscribeCourse(currentUser.getUser().getId(), courseId);
        return ResponseEntity.ok("Đăng ký nhận thông báo thành công!");
    }

    // 2. Sinh viên xem thông báo
    @GetMapping("/student/notifications")
    public ResponseEntity<?> getMyNotifications(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(syllabusService.getMyNotifications(currentUser.getUser().getId()));
    }
}