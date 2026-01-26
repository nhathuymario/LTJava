package com.example.LTJava.syllabus.service;

import com.example.LTJava.syllabus.dto.CourseOutcomesRequest;
import com.example.LTJava.syllabus.entity.SyllabusContent;

public interface SyllabusContentService {
    SyllabusContent saveOrUpdate(Long syllabusId, CourseOutcomesRequest request, Long lecturerId);
    SyllabusContent getBysyllabusId(Long syllabusId);
}
