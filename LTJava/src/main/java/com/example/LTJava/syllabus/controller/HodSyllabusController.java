package com.example.LTJava.syllabus.controller;

import java.util.List;

import com.example.LTJava.syllabus.dto.HodCourseGroupResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.LTJava.auth.security.CustomUserDetails;
import com.example.LTJava.syllabus.dto.RequestEditSyllabusRequest;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.SyllabusStatus;
import com.example.LTJava.syllabus.service.SyllabusService;

@RestController
@RequestMapping("/api/hod/syllabus")
@PreAuthorize("hasRole('HOD')")
public class HodSyllabusController {

    private final SyllabusService syllabusService;

    public HodSyllabusController(SyllabusService syllabusService) {
        this.syllabusService = syllabusService;
    }

    @GetMapping
    public ResponseEntity<List<Syllabus>> listByStatus(@RequestParam SyllabusStatus status) {
        return ResponseEntity.ok(syllabusService.getByStatus(status));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Syllabus> approve(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        Long hodId = currentUser.getUser().getId();
        return ResponseEntity.ok(syllabusService.approveByHod(id, hodId));
    }

    @PutMapping("/{id}/request-edit")
    public ResponseEntity<Syllabus> requestEdit(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id,
            @RequestBody RequestEditSyllabusRequest request
    ) {
        Long hodId = currentUser.getUser().getId();
        return ResponseEntity.ok(syllabusService.requestEditByHod(id, hodId, request.getNote()));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Syllabus> reject(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id,
            @RequestBody(required = false) RequestEditSyllabusRequest request
    ) {
        Long hodId = currentUser.getUser().getId();
        String reason = (request == null ? null : request.getNote());
        return ResponseEntity.ok(syllabusService.rejectByHod(id, hodId, reason));
    }

    @GetMapping("/{courseId}/syllabi")
    public List<Syllabus> getDraftSyllabiByCourse(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "DRAFT") SyllabusStatus status
    ) {
        return syllabusService.getByCourseAndStatus(courseId, status);
    }



    @GetMapping("/courses")
    public List<HodCourseGroupResponse> listCoursesHavingSyllabusStatus(
            @RequestParam(defaultValue = "DRAFT") SyllabusStatus syllabusStatus
    ) {
        return syllabusService.listCoursesHavingSyllabusStatus(syllabusStatus);
    }

}
