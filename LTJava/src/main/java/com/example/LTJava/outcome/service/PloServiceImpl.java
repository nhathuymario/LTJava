package com.example.LTJava.outcome.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.LTJava.outcome.dto.PloDto;
import com.example.LTJava.outcome.dto.PloUpsertReq;
import com.example.LTJava.outcome.entity.Plo;
import com.example.LTJava.outcome.repository.PloRepo;

@Service
public class PloServiceImpl implements PloService {

    private final PloRepo ploRepo;

    public PloServiceImpl(PloRepo ploRepo) {
        this.ploRepo = ploRepo;
    }

    @Override
    public List<PloDto> listAll(String scopeKey) {
        return ploRepo.findByScopeKeyOrderByCodeAsc(scopeKey) // ✅ ALL (không active=true)
                .stream()
                .map(this::toDto)
                .toList();
    }


    @Override
    @Transactional
    public PloDto create(PloUpsertReq req) {
        validate(req);

        Plo p = new Plo();
        p.setScopeKey(req.scopeKey().trim());
        p.setCode(req.code().trim());
        p.setDescription(req.description().trim());
        p.setActive(req.active() != null ? req.active() : true);

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
        p.setActive(req.active() != null ? req.active() : p.getActive());

        return toDto(ploRepo.save(p));
    }

    @Override
    @Transactional
    public void softDelete(Long id) {
        Plo p = ploRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PLO not found: " + id));
        p.setActive(false);
        // save() không bắt buộc nếu entity managed, nhưng cứ save cho chắc
        ploRepo.save(p);
    }

    @Override
    @Transactional
    public void hardDelete(Long id) {
        if (!ploRepo.existsById(id)) {
            throw new IllegalArgumentException("PLO not found: " + id);
        }
        ploRepo.deleteById(id);
    }

    // Nếu bạn đã thêm endpoint /{id}/hard thì implement thêm trong interface PloService:
    // @Override
    // @Transactional
    // public void hardDelete(Long id) {
    //     ploRepo.deleteById(id);
    // }

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
