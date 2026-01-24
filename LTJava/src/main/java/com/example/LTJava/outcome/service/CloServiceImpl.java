package com.example.LTJava.outcome.service;

import com.example.LTJava.outcome.dto.*;
import com.example.LTJava.outcome.entity.Clo;
import com.example.LTJava.outcome.repository.CloRepo;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.SyllabusStatus;
import com.example.LTJava.syllabus.repository.SyllabusRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;

@Service
public class CloServiceImpl implements CloService {

    private final CloRepo cloRepo;
    private final SyllabusRepository syllabusRepo;

    private static final EnumSet<SyllabusStatus> EDITABLE = EnumSet.of(
            SyllabusStatus.DRAFT,
            SyllabusStatus.REQUESTEDIT,
            SyllabusStatus.REJECTED
    );

    public CloServiceImpl(CloRepo cloRepo, SyllabusRepository syllabusRepo) {
        this.cloRepo = cloRepo;
        this.syllabusRepo = syllabusRepo;
    }

    @Override
    public List<CloDto> listBySyllabus(Long syllabusId) {
        return cloRepo.findBySyllabusIdOrderByCodeAsc(syllabusId)
                .stream().map(this::toDto).toList();
    }

    @Override
    @Transactional
    public CloDto create(Long syllabusId, CloUpsertReq req) {
        validate(req);
        Syllabus s = getEditableSyllabusOrThrow(syllabusId);

        Clo c = new Clo();
        c.setSyllabus(s);
        c.setCode(req.code().trim());
        c.setDescription(req.description().trim());
        c.setDomain(req.domain());
        c.setWeight(req.weight());
        c.setActive(req.active() == null ? true : req.active());

        return toDto(cloRepo.save(c));
    }

    @Override
    @Transactional
    public CloDto update(Long cloId, CloUpsertReq req) {
        validate(req);

        Clo c = cloRepo.findById(cloId)
                .orElseThrow(() -> new IllegalArgumentException("CLO not found: " + cloId));

        // khóa theo status syllabus
        getEditableSyllabusOrThrow(c.getSyllabus().getId());

        c.setCode(req.code().trim());
        c.setDescription(req.description().trim());
        c.setDomain(req.domain());
        c.setWeight(req.weight());
        c.setActive(req.active() == null ? c.getActive() : req.active());

        return toDto(cloRepo.save(c));
    }

    @Override
    @Transactional
    public void delete(Long cloId) {
        Clo c = cloRepo.findById(cloId)
                .orElseThrow(() -> new IllegalArgumentException("CLO not found: " + cloId));
        getEditableSyllabusOrThrow(c.getSyllabus().getId());
        cloRepo.delete(c);
    }

    private Syllabus getEditableSyllabusOrThrow(Long syllabusId) {
        Syllabus s = syllabusRepo.findById(syllabusId)
                .orElseThrow(() -> new IllegalArgumentException("Syllabus not found: " + syllabusId));
        if (!EDITABLE.contains(s.getStatus())) {
            throw new IllegalStateException("Syllabus is not editable in status: " + s.getStatus());
        }
        return s;
    }

    private void validate(CloUpsertReq req) {
        if (req == null) throw new IllegalArgumentException("Body is required");
        if (req.code() == null || req.code().isBlank()) throw new IllegalArgumentException("code is required");
        if (req.description() == null || req.description().isBlank()) throw new IllegalArgumentException("description is required");
    }

    private CloDto toDto(Clo c) {
        return new CloDto(
                c.getId(),
                c.getSyllabus().getId(),
                c.getCode(),
                c.getDescription(),
                c.getDomain(),
                c.getWeight(),
                c.getActive()
        );
    }
}
