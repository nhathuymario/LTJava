package com.example.LTJava.outcome.dto;

public record PloUpsertReq(
        String scopeKey,
        String code,
        String description,
        Boolean active
) {}
