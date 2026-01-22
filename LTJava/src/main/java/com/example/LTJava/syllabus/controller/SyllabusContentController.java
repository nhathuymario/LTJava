package com.example.LTJava.syllabus.controller;

import com.example.LTJava.auth.security.CustomUserDetails;
import com.example.LTJava.syllabus.dto.SyllabusContentRequest;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.SyllabusContent;
import com.example.LTJava.syllabus.repository.SyllabusContentRepository;
import com.example.LTJava.syllabus.repository.SyllabusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/syllabus-content")
public class SyllabusContentController {

    @Autowired
    private SyllabusContentRepository repo;

    @Autowired
    private SyllabusRepository syllabusRepo;

    // ===== VIEW (mọi role) =====
    @GetMapping("/{syllabusId}")
    public ResponseEntity<?> get(@PathVariable Long syllabusId) {
        return ResponseEntity.ok(
                repo.findBySyllabus_Id(syllabusId).orElse(null)
        );
    }

    // ===== EDIT (LECTURER ONLY) =====
    @PreAuthorize("hasRole('LECTURER')")
    @PutMapping("/{syllabusId}")
    public ResponseEntity<?> save(
            @PathVariable Long syllabusId,
            @RequestBody SyllabusContentRequest req,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Syllabus syllabus = syllabusRepo.findById(syllabusId)
                .orElseThrow();

        if (!syllabus.getCreatedBy().getId()
                .equals(user.getUser().getId()))
            throw new RuntimeException("Không phải syllabus của bạn");

        SyllabusContent c = repo.findBySyllabus_Id(syllabusId)
                .orElse(new SyllabusContent());

        c.setSyllabus(syllabus);
        c.setCourseOutlineTable(req.getCourseOutlineTable());
        c.setTeachingMethods(req.getTeachingMethods());
        c.setCourseOutcomes(req.getCourseOutcomes());

        return ResponseEntity.ok(repo.save(c));
    }
}

