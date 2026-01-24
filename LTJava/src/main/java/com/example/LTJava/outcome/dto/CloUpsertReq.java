package com.example.LTJava.outcome.dto;

public record CloUpsertReq(
        String code,
        String description,
        String domain,
        Integer weight,
        Boolean active
) {}
