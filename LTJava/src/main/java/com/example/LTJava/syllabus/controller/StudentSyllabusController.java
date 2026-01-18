package com.example.LTJava.syllabus.controller;

import java.util.List;

import com.example.LTJava.syllabus.entity.Course;
import com.example.LTJava.syllabus.entity.SyllabusStatus;
import com.example.LTJava.syllabus.repository.CourseRepository;
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
    private final CourseRepository courseRepository;

    public StudentSyllabusController(SyllabusService syllabusService, CourseRepository courseRepository) {
        this.syllabusService = syllabusService;
        this.courseRepository = courseRepository;
    }

    // NEW: danh sách course mà student đã subscribe/đăng ký
    @GetMapping("/my-courses")
    public ResponseEntity<?> myCourses(@AuthenticationPrincipal CustomUserDetails currentUser) {
        Long userId = currentUser.getUser().getId();
        return ResponseEntity.ok(syllabusService.getMySubscribedCourses(userId));
    }

    @GetMapping("/available")
    public ResponseEntity<List<Course>> availableCourses(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        Long userId = currentUser.getUser().getId();
        return ResponseEntity.ok(
                courseRepository.findAvailableCoursesForStudent(userId)
        );
    }

    // NEW: syllabus public của 1 course (chỉ cho phép nếu student đã subscribe course đó)
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Syllabus>> publishedByCourse(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long courseId
    ) {
        Long userId = currentUser.getUser().getId();
        return ResponseEntity.ok(syllabusService.getPublishedByCourseForStudent(userId, courseId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Syllabus>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) String semester
    ) {
        // NOTE: nếu muốn search cũng chỉ giới hạn trong course đã đăng ký,
        // thì đổi sang syllabusService.searchMySubscribedSyllabus(userId, keyword, academicYear, semester)
        return ResponseEntity.ok(syllabusService.searchSyllabus(keyword, academicYear, semester));
    }

    @GetMapping("/{id:\\d+}")
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
