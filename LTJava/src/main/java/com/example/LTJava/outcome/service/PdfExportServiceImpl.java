
package com.example.LTJava.outcome.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.LTJava.outcome.dto.CloDto;
import com.example.LTJava.outcome.dto.CloPloMatrixRes;
import com.example.LTJava.outcome.dto.MatrixCellDto;
import com.example.LTJava.outcome.dto.PdfExportRes;
import com.example.LTJava.outcome.dto.PloDto;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.repository.SyllabusRepository;

@Service
public class PdfExportServiceImpl implements PdfExportService {

    private final SyllabusRepository syllabusRepo;
    private final MatrixService matrixService;

    // cấu hình trong application.properties: app.storage.pdf-dir=uploads/pdfs
    private final Path pdfDir;

    public PdfExportServiceImpl(
            SyllabusRepository syllabusRepo,
            MatrixService matrixService,
            @Value("${app.storage.pdf-dir:uploads/pdfs}") String pdfDir
    ) {
        this.syllabusRepo = syllabusRepo;
        this.matrixService = matrixService;
        this.pdfDir = Paths.get(pdfDir);
    }

    @Override
    @Transactional(readOnly = true)
    public PdfExportRes exportPdf(Long syllabusId, String scopeKey) {
        if (scopeKey == null || scopeKey.isBlank()) throw new IllegalArgumentException("scopeKey is required");

        Syllabus s = syllabusRepo.findById(syllabusId)
                .orElseThrow(() -> new IllegalArgumentException("Syllabus not found: " + syllabusId));

        CloPloMatrixRes matrix = matrixService.getMatrix(syllabusId, scopeKey);

        try {
            Files.createDirectories(pdfDir);
            Path out = pdfDir.resolve("syllabus-" + syllabusId + ".pdf");

            generatePdf(out, s, matrix);

            return new PdfExportRes(
                    syllabusId,
                    true,
                    LocalDateTime.now(),
                    "/api/syllabus/" + syllabusId + "/pdf"
            );
        } catch (IOException e) {
            throw new RuntimeException("Export PDF failed: " + e.getMessage(), e);
        }
    }

    @Override
    public Resource loadPdf(Long syllabusId) {
        Path p = pdfDir.resolve("syllabus-" + syllabusId + ".pdf");
        if (!Files.exists(p)) {
            throw new IllegalArgumentException("PDF not found for syllabusId: " + syllabusId);
        }
        return new FileSystemResource(p);
    }

    private void generatePdf(Path out, Syllabus s, CloPloMatrixRes matrix) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float margin = 50;
                float y = page.getMediaBox().getHeight() - margin;

                // Title
                y = writeLine(cs, "SYLLABUS", margin, y, 16, true);
                y -= 8;

                // Basic info
                y = writeLine(cs, "Title: " + nullSafe(s.getTitle()), margin, y, 11, false);
                y = writeLine(cs, "Course: " + (s.getCourse() != null ? nullSafe(s.getCourse().getCode()) + " - " + nullSafe(s.getCourse().getName()) : "N/A"), margin, y, 11, false);
                y = writeLine(cs, "Academic Year: " + nullSafe(s.getAcademicYear()) + " | Semester: " + nullSafe(s.getSemester()), margin, y, 11, false);
                y = writeLine(cs, "Version: v" + (s.getVersion() == null ? "" : s.getVersion()) + " | Status: " + (s.getStatus() == null ? "" : s.getStatus().name()), margin, y, 11, false);
                y = writeLine(cs, "ScopeKey (PLO): " + matrix.scopeKey(), margin, y, 11, false);

                y -= 14;

                // CLO list
                y = writeLine(cs, "CLOs:", margin, y, 12, true);
                for (CloDto clo : matrix.clos()) {
                    y = writeLine(cs, "- " + nullSafe(clo.code()) + ": " + shorten(nullSafe(clo.description()), 120), margin, y, 10, false);
                    if (y < 120) break; // đơn giản: không auto add page ở bản demo
                }

                y -= 10;

                // PLO list
                y = writeLine(cs, "PLOs:", margin, y, 12, true);
                for (PloDto plo : matrix.plos()) {
                    y = writeLine(cs, "- " + nullSafe(plo.code()) + ": " + shorten(nullSafe(plo.description()), 120), margin, y, 10, false);
                    if (y < 120) break;
                }

                y -= 14;

                // Matrix (table đơn giản)
                y = writeLine(cs, "CLO-PLO Matrix:", margin, y, 12, true);
                y -= 6;

                drawMatrixTable(cs, page, margin, y, matrix);
            }

            doc.save(out.toFile());
        }
    }

    private void drawMatrixTable(PDPageContentStream cs, PDPage page, float x, float yTop, CloPloMatrixRes matrix) throws IOException {
        List<PloDto> plos = matrix.plos();
        List<CloDto> clos = matrix.clos();

        // map cell -> level
        Map<String, Integer> cellMap = new HashMap<>();
        for (MatrixCellDto c : matrix.cells()) {
            if (c.cloId() == null || c.ploId() == null) continue;
            int level = (c.level() != null) ? (int) c.level() : 1;
            cellMap.put(c.cloId() + "_" + c.ploId(), level);
        }

        float tableWidth = page.getMediaBox().getWidth() - x * 2;
        float firstColW = 90;
        int ploCount = Math.max(plos.size(), 1);
        float colW = (tableWidth - firstColW) / ploCount;

        float rowH = 18;
        float y = yTop;

        // Header row
        drawCellText(cs, "CLO \\ PLO", x, y, firstColW, rowH, true);
        for (int j = 0; j < plos.size(); j++) {
            drawCellText(cs, plos.get(j).code(), x + firstColW + j * colW, y, colW, rowH, true);
        }
        y -= rowH;

        // Rows
        for (CloDto clo : clos) {
            drawCellText(cs, clo.code(), x, y, firstColW, rowH, true);

            for (int j = 0; j < plos.size(); j++) {
                PloDto plo = plos.get(j);
                Integer level = cellMap.get(clo.id() + "_" + plo.id());
                String val = level == null ? "" : String.valueOf(level); // hoặc "X"
                drawCellText(cs, val, x + firstColW + j * colW, y, colW, rowH, false);
            }
            y -= rowH;

            // stop nếu sắp hết trang (demo)
            if (y < 70) break;
        }
    }

    private void drawCellText(PDPageContentStream cs, String text, float x, float yTop, float w, float h, boolean bold) throws IOException {
        // border
        cs.addRect(x, yTop - h, w, h);
        cs.stroke();

        // text
        cs.beginText();
        cs.setFont(bold ? PDType1Font.HELVETICA_BOLD : PDType1Font.HELVETICA, 9);
        cs.newLineAtOffset(x + 3, yTop - 12);
        cs.showText(text == null ? "" : text);
        cs.endText();
    }

    private float writeLine(PDPageContentStream cs, String text, float x, float y, int fontSize, boolean bold) throws IOException {
        cs.beginText();
        cs.setFont(bold ? PDType1Font.HELVETICA_BOLD : PDType1Font.HELVETICA, fontSize);
        cs.newLineAtOffset(x, y);
        cs.showText(text == null ? "" : text);
        cs.endText();
        return y - (fontSize + 3);
    }

    private String nullSafe(String s) {
        return s == null ? "" : s;
    }

    private String shorten(String s, int max) {
        if (s == null) return "";
        if (s.length() <= max) return s;
        return s.substring(0, max - 3) + "...";
    }
}
