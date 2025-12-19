package com.example.LTJava.syllabus.service;

import com.example.LTJava.syllabus.dto.CreateSyllabusRequest;
import com.example.LTJava.syllabus.entity.Syllabus;

import java.util.List;

public interface SyllabusService {

    Syllabus createSyllabus(CreateSyllabusRequest request, Long lecturerId);
    Syllabus submitSyllabus(Long syllabusId, Long lecturerId);
    Syllabus resubmitSyllabus(Long syllabusId, Long lecturerId);
//để tạm check thông tin
    List<Syllabus> getMySyllabus(Long id);
}
