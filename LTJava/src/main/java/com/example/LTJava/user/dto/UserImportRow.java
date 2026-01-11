package com.example.LTJava.user.dto;

import java.time.LocalDate;

public class UserImportRow {

    private int excelRowNumber; // để báo lỗi đúng dòng excel
    private String cccd;
    private String fullName;
    private LocalDate dateOfBirth;
    private String roleName;

    public int getExcelRowNumber() {
        return excelRowNumber;
    }

    public void setExcelRowNumber(int excelRowNumber) {
        this.excelRowNumber = excelRowNumber;
    }

    public String getCccd() {
        return cccd;
    }

    public void setCccd(String cccd) {
        this.cccd = cccd;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

}
