package com.example.LTJava.outcome.service;

import com.example.LTJava.outcome.dto.CreateCLORequest;
import com.example.LTJava.outcome.entity.CLO;
import com.example.LTJava.outcome.repository.CLORepository;
import com.example.LTJava.outcome.repository.CLOPLORepository;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.service.SyllabusService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class CLOService {

    private final CLORepository repo;
    private final CLOPLORepository mappingRepo;
    private final SyllabusService syllabusService;

    public CLOService(
            CLORepository repo,
            CLOPLORepository mappingRepo,
            SyllabusService syllabusService
    ) {
        this.repo = repo;
        this.mappingRepo = mappingRepo;
        this.syllabusService = syllabusService;
    }

    public CLO create(Long syllabusId, CreateCLORequest req) {
        Syllabus s = syllabusService.getById(syllabusId);

        CLO clo = new CLO();
        clo.setCode(req.code);
        clo.setDescription(req.description);
        clo.setSyllabus(s);

        return repo.save(clo);
    }

    public CLO update(Long id, CreateCLORequest req) {
        CLO clo = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CLO không tồn tại"));

        clo.setCode(req.getCode());
        clo.setDescription(req.getDescription());

        return repo.save(clo);
    }

    public void delete(Long id) {
        CLO clo = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CLO không tồn tại"));

        mappingRepo.deleteByCloId(id); // xoá ánh xạ CLO–PLO trước
        repo.delete(clo);
    }

    public List<CLO> getBySyllabus(Long syllabusId) {
        return repo.findBySyllabusId(syllabusId);
    }
}
