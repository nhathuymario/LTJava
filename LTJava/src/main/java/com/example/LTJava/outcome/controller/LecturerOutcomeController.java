package com.example.LTJava.outcome.controller;

import com.example.LTJava.outcome.dto.*;
import com.example.LTJava.outcome.entity.*;
import com.example.LTJava.outcome.service.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lecturer/outcomes")
public class LecturerOutcomeController {

    private final CLOService cloService;
    private final CLOPLOService mappingService;
    private final PLOService ploService;

    public LecturerOutcomeController(
            CLOService cloService,
            CLOPLOService mappingService,
            PLOService ploService
    ) {
        this.cloService = cloService;
        this.mappingService = mappingService;
        this.ploService = ploService;
    }

    @PreAuthorize("hasRole('LECTURER')")
    @PostMapping("/syllabus/{syllabusId}/clo")
    public CLO createClo(
            @PathVariable Long syllabusId,
            @RequestBody CreateCLORequest req
    ) {
        return cloService.create(syllabusId, req);
    }

    @PreAuthorize("hasAnyRole('LECTURER', 'AA')")
    @GetMapping("/syllabus/{syllabusId}/clo")
    public List<CLO> getClo(@PathVariable Long syllabusId) {
        return cloService.getBySyllabus(syllabusId);
    }

    @PreAuthorize("hasRole('LECTURER')")
    @GetMapping("/plo")
    public List<PLO> getAllPlo() {
        return ploService.getAll();
    }

    @PreAuthorize("hasRole('LECTURER')")
    @PostMapping("/map")
    public CLOPLO map(@RequestBody MapCloPloRequest req) {
        return mappingService.map(req);
    }

    @PreAuthorize("hasRole('LECTURER')")
    @GetMapping("/syllabus/{syllabusId}/map")
    public List<CLOPLO> getMap(@PathVariable Long syllabusId) {
        return mappingService.getMappingBySyllabus(syllabusId);
    }

    @PreAuthorize("hasRole('LECTURER')")
    @PutMapping("/clo/{id}")
    public CLO updateClo(
            @PathVariable Long id,
            @RequestBody CreateCLORequest req
    ) {
        return cloService.update(id, req);
    }

    @PreAuthorize("hasRole('LECTURER')")
    @DeleteMapping("/clo/{id}")
    public void deleteClo(@PathVariable Long id) {
        cloService.delete(id);
    }
}

