// com.example.LTJava.outcome.controller.PdfController
package com.example.LTJava.outcome.controller;

import com.example.LTJava.outcome.dto.PdfExportRes;
import com.example.LTJava.outcome.service.PdfExportService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
public class PdfController {

    private final PdfExportService pdfExportService;

    public PdfController(PdfExportService pdfExportService) {
        this.pdfExportService = pdfExportService;
    }

    @PostMapping("/api/syllabus/{syllabusId}/export-pdf")
    @PreAuthorize("hasAnyRole('LECTURER','HOD','AA','PRINCIPAL','SYSTEM_ADMIN')")
    public ResponseEntity<PdfExportRes> exportPdf(
            @PathVariable Long syllabusId,
            @RequestParam String scopeKey
    ) {
        return ResponseEntity.ok(pdfExportService.exportPdf(syllabusId, scopeKey));
    }

    @GetMapping("/api/syllabus/{syllabusId}/pdf")
    @PreAuthorize("hasAnyRole('LECTURER','HOD','AA','PRINCIPAL','SYSTEM_ADMIN','STUDENT')")
    public ResponseEntity<Resource> downloadPdf(@PathVariable Long syllabusId) {
        Resource pdf = pdfExportService.loadPdf(syllabusId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=syllabus-" + syllabusId + ".pdf")
                .body(pdf);
    }
}
