package com.example.LTJava.syllabus.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.example.LTJava.syllabus.service.SyllabusServiceImpl;
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

    // HOD xem list theo status (mặc định nên dùng SUBMITTED)
    @GetMapping
    public List<Syllabus> listByStatus(@RequestParam SyllabusStatus status) {
        return syllabusService.getByStatus(status);
    }

    // HOD Approve: SUBMITTED -> HOD_APPROVED
    @PutMapping("/{id}/approve")
    public ResponseEntity<Syllabus> approve(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        Long hodId = currentUser.getUser().getId();
        return ResponseEntity.ok(syllabusService.approveSyllabus(id, hodId));
    }

    // HOD Request edit: SUBMITTED -> REQUESTEDIT
    @PutMapping("/{id}/request-edit")
    public ResponseEntity<Syllabus> requestEdit(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id,
            @RequestBody RequestEditSyllabusRequest request
    ) {
        Long hodId = currentUser.getUser().getId();
        return ResponseEntity.ok(syllabusService.requestEditSyllabus(id, hodId, request.getNote()));
    }

    // ✅ HOD Reject: SUBMITTED -> REJECTED
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
}
