
package com.example.LTJava.outcome.service;

import com.example.LTJava.outcome.dto.PdfExportRes;
import org.springframework.core.io.Resource;

public interface PdfExportService {
    PdfExportRes exportPdf(Long syllabusId, String scopeKey);
    Resource loadPdf(Long syllabusId);
}
