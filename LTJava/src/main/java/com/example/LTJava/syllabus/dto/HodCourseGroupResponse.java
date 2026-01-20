package com.example.LTJava.syllabus.dto;

public class HodCourseGroupResponse {
    public Long courseId;
    public String code;
    public String name;
    public String department;
    public long count;

    public HodCourseGroupResponse(Long courseId, String code, String name, String department, long count) {
        this.courseId = courseId;
        this.code = code;
        this.name = name;
        this.department = department;
        this.count = count;
    }
}
