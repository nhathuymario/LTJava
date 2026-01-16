package com.example.LTJava.course.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CreateCourseRequest {
    private String code;
    private String name;
    private Integer credits;
    private String department;

    private Long lecturerId; // ✅ AA gán course cho lecturer
}
