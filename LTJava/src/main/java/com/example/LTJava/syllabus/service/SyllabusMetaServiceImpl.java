package com.example.LTJava.syllabus.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.LTJava.syllabus.exception.ResourceNotFoundException;
import com.example.LTJava.syllabus.entity.Course;
import com.example.LTJava.syllabus.dto.SyllabusMetaDto;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.repository.SyllabusRepository;
import com.example.LTJava.syllabus.service.SyllabusMetaService;

@Service
public class SyllabusMetaServiceImpl implements SyllabusMetaService {

    private final SyllabusRepository syllabusRepository;

    public SyllabusMetaServiceImpl(SyllabusRepository syllabusRepository) {
        this.syllabusRepository = syllabusRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public SyllabusMetaDto getMeta(Long syllabusId) {
        Syllabus s = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found"));

        Course c = s.getCourse();

        return new SyllabusMetaDto(
                s.getId(),
                s.getTitle(),
                s.getAcademicYear(),
                s.getSemester(),
                s.getAiSummary(),
                s.getKeywords(),
                s.getStatus() != null ? s.getStatus().name() : null,
                s.getVersion(),
                c != null ? c.getId() : null,
                c != null ? c.getCode() : null,
                c != null ? c.getName() : null
        );
    }
}
