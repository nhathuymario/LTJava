package com.example.LTJava.syllabus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.LTJava.auth.security.CustomUserDetails;
import com.example.LTJava.syllabus.dto.CreateSyllabusRequest;
import com.example.LTJava.syllabus.dto.RequestEditSyllabusRequest;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.SyllabusStatus;
import com.example.LTJava.syllabus.service.SyllabusService;

@RestController
@RequestMapping("/api/syllabus")
public class SyllabusController {
    private final SyllabusService syllabusService;

    public SyllabusController(SyllabusService syllabusService) {
        this.syllabusService = syllabusService;
    }

    // chỉ giảng viên mới được tạo giáo trình
    @PreAuthorize("hasRole('LECTURER')")
    @PostMapping("/create")
    public ResponseEntity<Syllabus> createSyllabus( @AuthenticationPrincipal CustomUserDetails currentUser, @RequestBody CreateSyllabusRequest request
    ) {
        Long lecturerId = currentUser.getUser().getId();

        Syllabus created = syllabusService.createSyllabus(request, lecturerId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('LECTURER')")
    @PutMapping("/{id}/submit")
    public ResponseEntity<Syllabus> submit( @AuthenticationPrincipal CustomUserDetails currentUser, @PathVariable Long id
    ) {
        Long lecturerId = currentUser.getUser().getId();
        Syllabus updated = syllabusService.submitSyllabus(id, lecturerId);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasRole('LECTURER')")
    @PutMapping("/{id}/resubmit")
    public ResponseEntity<Syllabus> resubmit( @AuthenticationPrincipal CustomUserDetails currentUser, @PathVariable Long id) {
        Long lecturerId = currentUser.getUser().getId();
        Syllabus updated = syllabusService.resubmitSyllabus(id, lecturerId);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasRole('HOD')")
    @GetMapping
    public List<Syllabus> getSyllabusByStatus(@RequestParam SyllabusStatus status) {
        return syllabusService.getSyllabusByStatus(status);
    }

    @PreAuthorize("hasRole('HOD')")
    @PutMapping("/{id}/approve")
    public ResponseEntity<Syllabus> approve( @AuthenticationPrincipal CustomUserDetails currentUser, @PathVariable Long id) {
        Long hodId = currentUser.getUser().getId();
        Syllabus updated = syllabusService.approveSyllabus(id, hodId);
        return ResponseEntity.ok(updated);
    }
    
    @PreAuthorize("hasRole('HOD')")
    @PutMapping("/{id}/request-edit")
    public ResponseEntity<Syllabus> requestEdit(@AuthenticationPrincipal CustomUserDetails currentUser, @PathVariable Long id, @RequestBody RequestEditSyllabusRequest request) {
        Long hodId = currentUser.getUser().getId();
        Syllabus updated = syllabusService.requestEditSyllabus(
                id, hodId, request.getNote()
        );
        return ResponseEntity.ok(updated);
    }

    //để tạm check thông tin LECTURER
    @PreAuthorize("hasRole('LECTURER')")
    @GetMapping("/my")
    public List<Syllabus> mySyllabus(@AuthenticationPrincipal CustomUserDetails user) {
        return syllabusService.getMySyllabus(user.getUser().getId());
    }

}
