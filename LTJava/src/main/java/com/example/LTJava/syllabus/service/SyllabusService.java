package com.example.LTJava.syllabus.service;

import java.util.List;

import com.example.LTJava.syllabus.dto.CreateSyllabusRequest;
import com.example.LTJava.syllabus.entity.Syllabus;

public interface SyllabusService {

    Syllabus createSyllabus(CreateSyllabusRequest request, Long lecturerId);
    Syllabus submitSyllabus(Long syllabusId, Long lecturerId);
    Syllabus resubmitSyllabus(Long syllabusId, Long lecturerId);
    Syllabus approveSyllabus(Long syllabusId, Long hodId);
    Syllabus requestEditSyllabus(Long syllabusId, Long hodId);
    //để tạm check thông tin
    List<Syllabus> getMySyllabus(Long id);
    List<Syllabus> getSubmittedSyllabus();
}
