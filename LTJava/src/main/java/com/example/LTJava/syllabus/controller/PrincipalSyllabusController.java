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
@RequestMapping("/api/principal/syllabus")
@PreAuthorize("hasRole('PRINCIPAL')")
public class PrincipalSyllabusController {

    private final SyllabusService syllabusService;

    public PrincipalSyllabusController(SyllabusService syllabusService) {
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
        Long principalId = currentUser.getUser().getId();
        return ResponseEntity.ok(syllabusService.approveByPrincipal(id, principalId));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Syllabus> reject(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id,
            @RequestBody(required = false) RequestEditSyllabusRequest request
    ) {
        Long principalId = currentUser.getUser().getId();
        String reason = (request == null ? null : request.getNote());
        return ResponseEntity.ok(syllabusService.rejectByPrincipal(id, principalId, reason));
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<Syllabus> publish(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        Long principalId = currentUser.getUser().getId();
        return ResponseEntity.ok(syllabusService.publish(id, principalId));
    }
}
