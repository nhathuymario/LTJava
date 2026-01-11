package com.example.LTJava.syllabus.controller;

import java.util.List;

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

    // HOD xem danh sách theo status (vd SUBMITTED)
    @GetMapping
    public List<Syllabus> listByStatus(@RequestParam SyllabusStatus status) {
        return syllabusService.getByStatus(status);
    }

    // Approve
    @PutMapping("/{id}/approve")
    public ResponseEntity<Syllabus> approve(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        Long hodId = currentUser.getUser().getId();
        return ResponseEntity.ok(syllabusService.approveSyllabus(id, hodId));
    }

    // Request edit
    @PutMapping("/{id}/request-edit")
    public ResponseEntity<Syllabus> requestEdit(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id,
            @RequestBody RequestEditSyllabusRequest request
    ) {
        Long hodId = currentUser.getUser().getId();
        return ResponseEntity.ok(
                syllabusService.requestEditSyllabus(id, hodId, request.getNote())
        );
    }
}
