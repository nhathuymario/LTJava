package com.example.LTJava.outcome.service;

import com.example.LTJava.outcome.dto.CreatePLORequest;
import com.example.LTJava.outcome.entity.PLO;
import com.example.LTJava.outcome.repository.PLORepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PLOService {
    private final PLORepository repo;

    public PLOService(PLORepository repo) {
        this.repo = repo;
    }

    public PLO create(CreatePLORequest req) {
        PLO p = new PLO();
        p.setCode(req.code);
        p.setDescription(req.description);
        p.setProgram(req.program);
        return repo.save(p);
    }

    public List<PLO> getAll() {
        return repo.findAll();
    }

    public PLO update(Long id, CreatePLORequest req) {
        PLO plo = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("PLO not found"));

        plo.setCode(req.code);
        plo.setDescription(req.description);
        plo.setProgram(req.program);

        return repo.save(plo);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("PLO not found");
        }
        repo.deleteById(id);
    }
}
