package com.example.LTJava.syllabus.dto;

public class SyllabusContentRequest {

    private String courseOutlineTable;
    private String teachingMethods;
    private String courseOutcomes;

    public String getCourseOutlineTable() {
        return courseOutlineTable;
    }

    public void setCourseOutlineTable(String courseOutlineTable) {
        this.courseOutlineTable = courseOutlineTable;
    }

    public String getTeachingMethods() {
        return teachingMethods;
    }

    public void setTeachingMethods(String teachingMethods) {
        this.teachingMethods = teachingMethods;
    }

    public String getCourseOutcomes() {
        return courseOutcomes;
    }

    public void setCourseOutcomes(String courseOutcomes) {
        this.courseOutcomes = courseOutcomes;
    }
}
