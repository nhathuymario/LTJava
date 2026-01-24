package com.example.LTJava.outcome.dto;

public record PloDto(
        Long id,
        String scopeKey,
        String code,
        String description,
        Boolean active
) {}
