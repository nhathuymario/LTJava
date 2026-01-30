package com.example.LTJava.syllabus.security;

import org.springframework.stereotype.Component;

import com.example.LTJava.syllabus.entity.SyllabusStatus;
import com.example.LTJava.syllabus.repository.SyllabusRepository;

@Component("syllabusSecurity")
public class SyllabusSecurity {

    private final SyllabusRepository syllabusRepository;

    public SyllabusSecurity(SyllabusRepository syllabusRepository) {
        this.syllabusRepository = syllabusRepository;
    }

    public boolean isPublished(Long syllabusId) {
        return syllabusRepository.findById(syllabusId)
                .map(s -> s.getStatus() == SyllabusStatus.PUBLISHED)
                .orElse(false);
    }
}
