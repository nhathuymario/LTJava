package com.example.LTJava.course.controller;

import com.example.LTJava.auth.security.CustomUserDetails;
import com.example.LTJava.course.dto.CreateCourseRequest;
import com.example.LTJava.course.entity.Course1;
import com.example.LTJava.course.service.CourseService;
//import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;


import java.util.List;

@RestController
@RequestMapping("/api/course")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

//    @PreAuthorize("hasRole('LECTURER')")
//    @PostMapping("/create")
//    public ResponseEntity<Course1> create(@RequestBody CreateCourseRequest req) {
//        Course1 created = courseService.create(req);
//        return new ResponseEntity<>(created, HttpStatus.CREATED);
//    }

    @PreAuthorize("hasRole('LECTURER')")
    @PostMapping("/create")
    public ResponseEntity<Course1> create(@RequestBody CreateCourseRequest req, Authentication authentication) {
        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();

        // DEBUG tạm để biết chắc có id không
        System.out.println("principal=" + principal);
        System.out.println("username=" + authentication.getName());

        Long lecturerId = principal.getId(); // nếu dòng này null -> lỗi của CustomUserDetails/JWT
        System.out.println("lecturerId=" + lecturerId);

        Course1 created = courseService.create(req, lecturerId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('LECTURER')")
    @GetMapping("/my")
    public List<Course1> getMyCourses(Authentication authentication) {
        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        Long lecturerId = principal.getId();

        return courseService.getMyCourses(lecturerId);
    }


    // ✅ Xem tất cả môn học
    @PreAuthorize("hasRole('LECTURER')")
    @GetMapping
    public List<Course1> getAllCourses() {
        return courseService.getAll();
    }

    // ✅ Xem chi tiết môn học
    @PreAuthorize("hasRole('LECTURER')")
    @GetMapping("/{id}")
    public Course1 getCourseById(@PathVariable Long id) {
        return courseService.getById(id);
    }
}
