package com.example.LTJava.user.importer;

import com.example.LTJava.user.dto.ImportUsersResult;
import com.example.LTJava.user.dto.UserImportRow;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Component
public class ExcelUserImporter {

    public record ParseResult(List<UserImportRow> rows, ImportUsersResult result) {}

    private final DataFormatter dataFormatter = new DataFormatter();
    private final DateTimeFormatter dmy = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public ParseResult parse(MultipartFile file) {
        ImportUsersResult result = new ImportUsersResult();
        List<UserImportRow> rows = new ArrayList<>();

        try (InputStream is = file.getInputStream();
             Workbook wb = WorkbookFactory.create(is)) {

            Sheet sheet = wb.getSheetAt(0);
            int lastRow = sheet.getLastRowNum();

            for (int i = 1; i <= lastRow; i++) { // row0 header
                Row r = sheet.getRow(i);
                if (r == null) continue;

                int excelRowNumber = i + 1;

                try {
                    // ✅ đúng thứ tự cột: fullName, cccd, dateOfBirth, roleName
                    String fullName = getText(r, 0);
                    String cccd = getText(r, 1);
                    String dobStr = getText(r, 2);
                    String roleName = getText(r, 3);

                    if (fullName.isBlank()) throw new IllegalArgumentException("fullName trống");
                    if (cccd.isBlank()) throw new IllegalArgumentException("cccd trống");
                    if (dobStr.isBlank()) throw new IllegalArgumentException("dateOfBirth trống");
                    if (roleName.isBlank()) throw new IllegalArgumentException("roleName trống");

                    // Nếu cột date là kiểu Date của Excel, convert ra dd/MM/yyyy
                    dobStr = normalizeDobIfExcelDate(r.getCell(2), dobStr);

                    // validate format dd/MM/yyyy (để khớp createUser của bạn)
                    LocalDate.parse(dobStr, dmy);

                    UserImportRow row = new UserImportRow();
                    row.setExcelRowNumber(excelRowNumber);
                    row.setFullName(fullName);
                    row.setCccd(cccd);
                    row.setDateOfBirth(LocalDate.parse(dobStr, dmy)); // nội bộ lưu LocalDate
                    row.setRoleName(roleName);

                    rows.add(row);

                } catch (Exception e) {
                    result.getErrors().add(new ImportUsersResult.RowError(excelRowNumber, e.getMessage()));
                }
            }

            result.setTotalRows(Math.max(0, lastRow));

        } catch (Exception e) {
            throw new RuntimeException("Không đọc được file Excel: " + e.getMessage(), e);
        }

        return new ParseResult(rows, result);
    }

    private String getText(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return "";
        // ✅ DataFormatter giữ nguyên chuỗi (tránh 1,23E+10)
        return dataFormatter.formatCellValue(cell).trim();
    }

    private String normalizeDobIfExcelDate(Cell cell, String currentText) {
        if (cell == null) return currentText;

        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            Date d = cell.getDateCellValue();
            LocalDate ld = d.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            return ld.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        }
        return currentText;
    }
}
