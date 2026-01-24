package com.example.LTJava.outcome.controller;

import com.example.LTJava.outcome.entity.CLOPLO;
import com.example.LTJava.outcome.service.CLOPLOService;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.SyllabusStatus;
import com.example.LTJava.syllabus.service.SyllabusService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/outcomes")
@PreAuthorize("hasRole('STUDENT')")
public class StudentOutcomeController {

    private final CLOPLOService mappingService;
    private final SyllabusService syllabusService;

    public StudentOutcomeController(
            CLOPLOService mappingService,
            SyllabusService syllabusService
    ) {
        this.mappingService = mappingService;
        this.syllabusService = syllabusService;
    }

    @GetMapping("/syllabus/{syllabusId}/map")
    public List<CLOPLO> getMap(@PathVariable Long syllabusId) {
        Syllabus s = syllabusService.getById(syllabusId);
        if (s.getStatus() != SyllabusStatus.PUBLISHED) {
            throw new AccessDeniedException("Syllabus not published");
        }
        return mappingService.getMappingBySyllabus(syllabusId);
    }
}

