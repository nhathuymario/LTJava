package com.example.LTJava.syllabus.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.LTJava.auth.security.CustomUserDetails;
import com.example.LTJava.syllabus.dto.CourseOutcomesRequest;
import com.example.LTJava.syllabus.entity.SyllabusContent;
import com.example.LTJava.syllabus.service.SyllabusContentService;

@RestController
@RequestMapping("/api/lecturer/syllabus/{syllabusId}/content")
public class SyllabusContentController {

    private final SyllabusContentService syllabusContentService;

    public SyllabusContentController(SyllabusContentService syllabusContentService) {
        this.syllabusContentService = syllabusContentService;
    }

    // VIEW
    @GetMapping
    public ResponseEntity<SyllabusContent> get(@PathVariable Long syllabusId) {
        return ResponseEntity.ok(syllabusContentService.getBysyllabusId(syllabusId));
    }

    // EDIT (LECTURER ONLY)
    @PreAuthorize("hasRole('LECTURER')")
    @PutMapping
    public ResponseEntity<SyllabusContent> save(
            @PathVariable Long syllabusId,
            @RequestBody CourseOutcomesRequest req,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        SyllabusContent content = syllabusContentService.saveOrUpdate(
                syllabusId,
                req,
                user.getUser().getId()
        );
        return ResponseEntity.ok(content);
    }
}

