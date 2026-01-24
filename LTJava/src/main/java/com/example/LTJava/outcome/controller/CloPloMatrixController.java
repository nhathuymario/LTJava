package com.example.LTJava.outcome.controller;

import com.example.LTJava.outcome.dto.*;
import com.example.LTJava.outcome.service.MatrixService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
public class CloPloMatrixController {

    private final MatrixService matrixService;

    public CloPloMatrixController(MatrixService matrixService) {
        this.matrixService = matrixService;
    }

    // HoD/AA/Principal/Lecturer đều xem được (tùy bạn nới rộng/thu hẹp)
    @GetMapping("/api/syllabus/{syllabusId}/clo-plo-matrix")
    @PreAuthorize("hasAnyRole('LECTURER','HOD','AA','PRINCIPAL','SYSTEM_ADMIN')")
    public ResponseEntity<CloPloMatrixRes> getMatrix(
            @PathVariable Long syllabusId,
            @RequestParam String scopeKey
    ) {
        return ResponseEntity.ok(matrixService.getMatrix(syllabusId, scopeKey));
    }

    // chỉ Lecturer lưu
    @PutMapping("/api/lecturer/syllabus/{syllabusId}/clo-plo-matrix")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<Void> saveMatrix(
            @PathVariable Long syllabusId,
            @RequestBody CloPloMatrixSaveReq req
    ) {
        matrixService.saveMatrix(syllabusId, req);
        return ResponseEntity.noContent().build();
    }
}
