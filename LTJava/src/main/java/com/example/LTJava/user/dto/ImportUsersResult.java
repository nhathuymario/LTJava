package com.example.LTJava.user.dto;

import java.util.ArrayList;
import java.util.List;

public class ImportUsersResult {

    private int totalRows;
    private int successCount;
    private int failedCount;
    private List<RowError> errors = new ArrayList<>();

    public record RowError(int excelRowNumber, String message) {}

    public int getTotalRows() {
        return totalRows;
    }

    public void setTotalRows(int totalRows) {
        this.totalRows = totalRows;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public int getFailedCount() {
        return failedCount;
    }

    public void setFailedCount(int failedCount) {
        this.failedCount = failedCount;
    }

    public List<RowError> getErrors() {
        return errors;
    }

    public void setErrors(List<RowError> errors) {
        this.errors = errors;
    }
}
