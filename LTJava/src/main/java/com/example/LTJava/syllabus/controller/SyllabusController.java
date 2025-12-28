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

    // 1. Xem lịch sử (Dành cho AA)
    @GetMapping("/aa/{id}/history")
    @PreAuthorize("hasRole('AA')")
    public ResponseEntity<?> getSyllabusHistory(@PathVariable Long id) {
        return ResponseEntity.ok(syllabusService.getHistory(id));
    }

    // 2. So sánh phiên bản hiện tại với bản cũ (Dành cho AA)
    // URL: /aa/1/compare?historyId=5
    @GetMapping("/aa/{id}/compare")
    @PreAuthorize("hasRole('AA')")
    public ResponseEntity<?> compareSyllabus(
            @PathVariable Long id,
            @RequestParam Long historyId) {
        return ResponseEntity.ok(syllabusService.compareVersions(id, historyId));
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
        // Copy logic compareVersions nhưng đổi tham số thành (Syllabus s1, Syllabus s2)
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
