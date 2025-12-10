package com.example.LTJava.syllabus.service;

import com.example.LTJava.syllabus.dto.CreateSyllabusRequest;
import com.example.LTJava.syllabus.entity.Syllabus;

public interface SyllabusService {

    Syllabus createSyllabus(CreateSyllabusRequest request, Long lecturerId);
}
