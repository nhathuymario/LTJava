
package com.example.LTJava.outcome.dto;

import java.time.LocalDateTime;

public record PdfExportRes(
        Long syllabusId,
        boolean pdfReady,
        LocalDateTime generatedAt,
        String downloadUrl
) {}
