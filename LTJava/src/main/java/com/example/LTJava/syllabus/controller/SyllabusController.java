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
@RequestMapping("/api/lecturer/syllabus")
@PreAuthorize("hasRole('LECTURER')")
public class SyllabusController {

    private final SyllabusService syllabusService;

    public SyllabusController(SyllabusService syllabusService) {
        this.syllabusService = syllabusService;
    }

    @PostMapping
    public ResponseEntity<Syllabus> create(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestBody CreateSyllabusRequest request
    ) {
        Long lecturerId = currentUser.getUser().getId();
        Syllabus created = syllabusService.createSyllabus(request, lecturerId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
    @PutMapping("/{id}")
    public ResponseEntity<Syllabus> update(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id,
            @RequestBody CreateSyllabusRequest request
    ) {
        Long lecturerId = currentUser.getUser().getId();
        return ResponseEntity.ok(syllabusService.updateSyllabus(id, request, lecturerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        Long lecturerId = currentUser.getUser().getId();
        syllabusService.deleteSyllabus(id, lecturerId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/submit")
    public ResponseEntity<Syllabus> submit(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        Long lecturerId = currentUser.getUser().getId();
        return ResponseEntity.ok(syllabusService.submitSyllabus(id, lecturerId));
    }

    @PutMapping("/{id}/resubmit")
    public ResponseEntity<Syllabus> resubmit(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        Long lecturerId = currentUser.getUser().getId();
        return ResponseEntity.ok(syllabusService.resubmitSyllabus(id, lecturerId));
    }

    @PutMapping("/{id}/move-to-draft")
    public ResponseEntity<Syllabus> moveToDraft(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        Long lecturerId = currentUser.getUser().getId();
        return ResponseEntity.ok(syllabusService.moveToDraftForEdit(id, lecturerId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Syllabus>> mySyllabus(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(syllabusService.getMySyllabus(user.getUser().getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Syllabus> getById(@PathVariable Long id) {
        return ResponseEntity.ok(syllabusService.getById(id));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Syllabus>> getByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(syllabusService.getByCourseId(courseId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Syllabus>> getByStatus(@PathVariable SyllabusStatus status) {
        return ResponseEntity.ok(syllabusService.getByStatus(status));
    }
}
