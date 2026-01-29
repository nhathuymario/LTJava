package com.example.LTJava.syllabus.dto;

import java.util.List;

public record CourseRelationsResponse(
        Long courseId,
        List<Long> prerequisiteIds,
        List<Long> parallelIds,
        List<Long> supplementaryIds
) {}
