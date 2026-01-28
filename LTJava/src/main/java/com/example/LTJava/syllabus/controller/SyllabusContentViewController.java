package com.example.LTJava.syllabus.controller;

import com.example.LTJava.syllabus.entity.SyllabusContent;
import com.example.LTJava.syllabus.service.SyllabusContentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/syllabus/{syllabusId}/content")
public class SyllabusContentViewController {

    private final SyllabusContentService syllabusContentService;

    public SyllabusContentViewController(SyllabusContentService syllabusContentService) {
        this.syllabusContentService = syllabusContentService;
    }

    // ✅ VIEW CHUNG: HOD/AA/Principal/Lecturer/Student... đều xem được
    @GetMapping
    @PreAuthorize("hasAnyRole('LECTURER','HOD','AA','PRINCIPAL','SYSTEM_ADMIN','STUDENT')")
    public ResponseEntity<SyllabusContent> get(@PathVariable Long syllabusId) {
        return ResponseEntity.ok(syllabusContentService.getBysyllabusId(syllabusId));
    }
}
