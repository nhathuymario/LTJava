package com.example.LTJava.syllabus.dto;

public class CreateSyllabusRequest {

    private Long courseId;
    private String title;
    private String description;
    private String academicYear;   // ví dụ: "2025-2026"
    private String semester;       // ví dụ: "HK1"

    public CreateSyllabusRequest() {
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }
}
