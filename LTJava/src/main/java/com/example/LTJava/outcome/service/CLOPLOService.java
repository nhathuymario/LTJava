package com.example.LTJava.outcome.service;

import com.example.LTJava.outcome.dto.MapCloPloRequest;
import com.example.LTJava.outcome.entity.*;
import com.example.LTJava.outcome.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CLOPLOService {
    private final CLOPLORepository repo;
    private final CLORepository cloRepo;
    private final PLORepository ploRepo;

    public CLOPLOService(CLOPLORepository repo, CLORepository cloRepo, PLORepository ploRepo) {
        this.repo = repo;
        this.cloRepo = cloRepo;
        this.ploRepo = ploRepo;
    }

    public CLOPLO map(MapCloPloRequest req) {
        CLO clo = cloRepo.findById(req.cloId).orElseThrow();
        PLO plo = ploRepo.findById(req.ploId).orElseThrow();

        CLOPLO m = new CLOPLO();
        m.setClo(clo);
        m.setPlo(plo);
        return repo.save(m);
    }

    public List<CLOPLO> getMappingBySyllabus(Long syllabusId) {
        return repo.findByClo_Syllabus_Id(syllabusId);
    }
}
