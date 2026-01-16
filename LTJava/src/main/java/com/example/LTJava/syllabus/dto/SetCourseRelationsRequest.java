package com.example.LTJava.syllabus.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class SetCourseRelationsRequest {
    private Long courseId;
    private List<Long> prerequisiteIds;
    private List<Long> parallelIds;
    private List<Long> supplementaryIds;
}
