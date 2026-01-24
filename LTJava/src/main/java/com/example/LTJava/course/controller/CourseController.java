package com.example.LTJava.course.controller;

import com.example.LTJava.course.dto.AssignLecturerRequest;
import com.example.LTJava.course.dto.CreateCourseRequest;
import com.example.LTJava.course.entity.Course1;
import com.example.LTJava.course.service.CourseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }



    // ✅ AA: create/update/delete/assign
    @PreAuthorize("hasRole('AA')")
    @PostMapping("/create")
    public ResponseEntity<Course1> create(@RequestBody CreateCourseRequest req) {
        Course1 created = courseService.create(req);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('AA')")
    @PutMapping("/{id}")
    public Course1 update(@PathVariable Long id, @RequestBody CreateCourseRequest req) {
        return courseService.update(id, req);
    }

    @PreAuthorize("hasRole('AA')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        courseService.delete(id);
    }

    @PreAuthorize("hasRole('AA')")
    @PutMapping("/{id}/assign")
    public Course1 assignLecturer(@PathVariable Long id, @RequestBody AssignLecturerRequest req) {
        return courseService.assignLecturer(id, req);
    }

    // ✅ Lecturer: chỉ xem course của mình theo username trong JWT
    @PreAuthorize("hasRole('LECTURER')")
    @GetMapping("/my")
    public List<Course1> myCourses(Authentication auth) {
        String username = auth.getName(); // JWT sub
        return courseService.getByLecturerUsername(username);
    }

    // ✅ Xem tất cả / chi tiết: AA + Lecturer
    @PreAuthorize("hasAnyRole('LECTURER','AA')")
    @GetMapping
    public List<Course1> getAllCourses() {
        return courseService.getAll();
    }

    @PreAuthorize("hasAnyRole('LECTURER','AA')")
    @GetMapping("/{id}")
    public Course1 getCourseById(@PathVariable Long id) {
        return courseService.getById(id);
    }
}
