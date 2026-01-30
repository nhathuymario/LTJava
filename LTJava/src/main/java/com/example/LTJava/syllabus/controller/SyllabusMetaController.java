package com.example.LTJava.syllabus.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.LTJava.syllabus.dto.SyllabusMetaDto;
import com.example.LTJava.syllabus.service.SyllabusMetaService;

@RestController
@RequestMapping("/api/syllabus")
public class SyllabusMetaController {

    private final SyllabusMetaService syllabusMetaService;

    public SyllabusMetaController(SyllabusMetaService syllabusMetaService) {
        this.syllabusMetaService = syllabusMetaService;
    }

    @GetMapping("/{id}/meta")
    @PreAuthorize("""
        hasAnyRole('LECTURER','HOD','AA','PRINCIPAL','SYSTEM_ADMIN')
        or (hasRole('STUDENT') and @syllabusSecurity.isPublished(#id))
    """)
    public SyllabusMetaDto getMeta(@PathVariable("id") Long id) {
        return syllabusMetaService.getMeta(id);
    }
}
