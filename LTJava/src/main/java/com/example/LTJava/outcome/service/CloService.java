package com.example.LTJava.outcome.service;

import com.example.LTJava.outcome.dto.*;

import java.util.List;

public interface CloService {
    List<CloDto> listBySyllabus(Long syllabusId);
    CloDto create(Long syllabusId, CloUpsertReq req);
    CloDto update(Long cloId, CloUpsertReq req);
    void delete(Long cloId);
}
