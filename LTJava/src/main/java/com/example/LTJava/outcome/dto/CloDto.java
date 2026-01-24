package com.example.LTJava.outcome.dto;

public record CloDto(
        Long id,
        Long syllabusId,
        String code,
        String description,
        String domain,
        Integer weight,
        Boolean active
) {}
