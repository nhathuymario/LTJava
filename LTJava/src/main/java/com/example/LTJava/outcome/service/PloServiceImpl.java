package com.example.LTJava.outcome.service;

import com.example.LTJava.outcome.dto.*;
import com.example.LTJava.outcome.entity.Plo;
import com.example.LTJava.outcome.repository.PloRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PloServiceImpl implements PloService {

    private final PloRepo ploRepo;

    public PloServiceImpl(PloRepo ploRepo) {
        this.ploRepo = ploRepo;
    }

    @Override
    public List<PloDto> listActive(String scopeKey) {
        if (scopeKey == null || scopeKey.isBlank()) {
            throw new IllegalArgumentException("scopeKey is required");
        }
        return ploRepo.findByScopeKeyAndActiveTrueOrderByCodeAsc(scopeKey)
                .stream().map(this::toDto).toList();
    }

    @Override
    @Transactional
    public PloDto create(PloUpsertReq req) {
        validate(req);

        Plo p = new Plo();
        p.setScopeKey(req.scopeKey().trim());
        p.setCode(req.code().trim());
        p.setDescription(req.description().trim());
        p.setActive(req.active() == null ? true : req.active());

        return toDto(ploRepo.save(p));
    }

    @Override
    @Transactional
    public PloDto update(Long id, PloUpsertReq req) {
        validate(req);

        Plo p = ploRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PLO not found: " + id));

        p.setScopeKey(req.scopeKey().trim());
        p.setCode(req.code().trim());
        p.setDescription(req.description().trim());
        p.setActive(req.active() == null ? p.getActive() : req.active());

        return toDto(ploRepo.save(p));
    }

    @Override
    @Transactional
    public void softDelete(Long id) {
        Plo p = ploRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PLO not found: " + id));
        p.setActive(false);
        ploRepo.save(p);
    }

    private void validate(PloUpsertReq req) {
        if (req == null) throw new IllegalArgumentException("Body is required");
        if (req.scopeKey() == null || req.scopeKey().isBlank()) throw new IllegalArgumentException("scopeKey is required");
        if (req.code() == null || req.code().isBlank()) throw new IllegalArgumentException("code is required");
        if (req.description() == null || req.description().isBlank()) throw new IllegalArgumentException("description is required");
    }

    private PloDto toDto(Plo p) {
        return new PloDto(p.getId(), p.getScopeKey(), p.getCode(), p.getDescription(), p.getActive());
    }
}
