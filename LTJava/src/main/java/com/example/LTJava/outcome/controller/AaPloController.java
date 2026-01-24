package com.example.LTJava.outcome.controller;

import com.example.LTJava.outcome.dto.*;
import com.example.LTJava.outcome.service.PloService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aa/plos")
@PreAuthorize("hasRole('AA')")
public class AaPloController {

    private final PloService ploService;

    public AaPloController(PloService ploService) {
        this.ploService = ploService;
    }

    @GetMapping
    public ResponseEntity<List<PloDto>> list(@RequestParam String scopeKey) {
        return ResponseEntity.ok(ploService.listActive(scopeKey));
    }

    @PostMapping
    public ResponseEntity<PloDto> create(@RequestBody PloUpsertReq req) {
        return ResponseEntity.ok(ploService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PloDto> update(@PathVariable Long id, @RequestBody PloUpsertReq req) {
        return ResponseEntity.ok(ploService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ploService.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
