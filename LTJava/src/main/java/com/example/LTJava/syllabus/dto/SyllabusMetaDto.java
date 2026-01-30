package com.example.LTJava.syllabus.dto;

public record SyllabusMetaDto(
        Long id,
        String title,
        String academicYear,
        String semester,
        String aiSummary,
        String keywords,
        String status,
        Integer version,
        Long courseId,
        String courseCode,
        String courseName
) {}
