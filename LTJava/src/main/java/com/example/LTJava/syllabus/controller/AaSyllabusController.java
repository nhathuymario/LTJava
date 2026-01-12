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
@RequestMapping("/api/aa/syllabus")
@PreAuthorize("hasRole('AA')")
public class AaSyllabusController {

    private final SyllabusService syllabusService;

    public AaSyllabusController(SyllabusService syllabusService) {
        this.syllabusService = syllabusService;
    }

    // AA xem danh sách theo status (vd HOD_APPROVED, AA_APPROVED)
    @GetMapping
    public List<Syllabus> listByStatus(@RequestParam SyllabusStatus status) {
        return syllabusService.getByStatus(status);
    }

    // AA approve: HOD_APPROVED -> AA_APPROVED
    @PutMapping("/{id}/approve")
    public ResponseEntity<Syllabus> approve(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        Long aaId = currentUser.getUser().getId();
        return ResponseEntity.ok(syllabusService.approveByAa(id, aaId));
    }

    // AA publish: AA_APPROVED -> PUBLISHED
    @PutMapping("/{id}/publish")
    public ResponseEntity<Syllabus> publish(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        Long aaId = currentUser.getUser().getId();
        return ResponseEntity.ok(syllabusService.publish(id, aaId));
    }

    // (Optional) AA reject: HOD_APPROVED/AA_APPROVED -> REJECTED
    @PutMapping("/{id}/reject")
    public ResponseEntity<Syllabus> reject(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id,
            @RequestBody(required = false) RequestEditSyllabusRequest request
    ) {
        Long aaId = currentUser.getUser().getId();
        String reason = (request == null ? null : request.getNote());
        // Nếu bạn chưa làm method này thì comment lại
        return ResponseEntity.ok(syllabusService.rejectByAa(id, aaId, reason));
    }
}
