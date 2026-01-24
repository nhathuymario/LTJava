package com.example.LTJava.outcome.controller;

import com.example.LTJava.outcome.dto.*;
import com.example.LTJava.outcome.service.CloService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasRole('LECTURER')")
public class LecturerCloController {

    private final CloService cloService;

    public LecturerCloController(CloService cloService) {
        this.cloService = cloService;
    }

    @GetMapping("/api/lecturer/syllabus/{syllabusId}/clos")
    public ResponseEntity<List<CloDto>> list(@PathVariable Long syllabusId) {
        return ResponseEntity.ok(cloService.listBySyllabus(syllabusId));
    }

    @PostMapping("/api/lecturer/syllabus/{syllabusId}/clos")
    public ResponseEntity<CloDto> create(@PathVariable Long syllabusId, @RequestBody CloUpsertReq req) {
        return ResponseEntity.ok(cloService.create(syllabusId, req));
    }

    @PutMapping("/api/lecturer/clos/{cloId}")
    public ResponseEntity<CloDto> update(@PathVariable Long cloId, @RequestBody CloUpsertReq req) {
        return ResponseEntity.ok(cloService.update(cloId, req));
    }

    @DeleteMapping("/api/lecturer/clos/{cloId}")
    public ResponseEntity<Void> delete(@PathVariable Long cloId) {
        cloService.delete(cloId);
        return ResponseEntity.noContent().build();
    }
}
