package com.example.LTJava.outcome.service;

import com.example.LTJava.outcome.dto.*;
import com.example.LTJava.outcome.entity.*;
import com.example.LTJava.outcome.repository.*;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.SyllabusStatus;
import com.example.LTJava.syllabus.repository.SyllabusRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class MatrixServiceImpl implements MatrixService {

    private final PloRepo ploRepo;
    private final CloRepo cloRepo;
    private final CloPloMapRepo mapRepo;
    private final SyllabusRepository syllabusRepo;

    private static final EnumSet<SyllabusStatus> EDITABLE = EnumSet.of(
            SyllabusStatus.DRAFT,
            SyllabusStatus.REQUESTEDIT,
            SyllabusStatus.REJECTED
    );

    public MatrixServiceImpl(PloRepo ploRepo, CloRepo cloRepo, CloPloMapRepo mapRepo, SyllabusRepository syllabusRepo) {
        this.ploRepo = ploRepo;
        this.cloRepo = cloRepo;
        this.mapRepo = mapRepo;
        this.syllabusRepo = syllabusRepo;
    }

    @Override
    public CloPloMatrixRes getMatrix(Long syllabusId, String scopeKey) {
        if (scopeKey == null || scopeKey.isBlank()) throw new IllegalArgumentException("scopeKey is required");

        // clos theo syllabus(version)
        List<Clo> clos = cloRepo.findBySyllabusIdOrderByCodeAsc(syllabusId);

        // plos theo scope
        List<Plo> plos = ploRepo.findByScopeKeyAndActiveTrueOrderByCodeAsc(scopeKey);

        // mapping theo syllabus
        List<CloPloMap> maps = mapRepo.findByCloSyllabusId(syllabusId);

        List<PloDto> ploDtos = plos.stream()
                .map(p -> new PloDto(p.getId(), p.getScopeKey(), p.getCode(), p.getDescription(), p.getActive()))
                .toList();

        List<CloDto> cloDtos = clos.stream()
                .map(c -> new CloDto(c.getId(), c.getSyllabus().getId(), c.getCode(), c.getDescription(), c.getDomain(), c.getWeight(), c.getActive()))
                .toList();

        List<MatrixCellDto> cells = maps.stream()
                .map(m -> new MatrixCellDto(m.getClo().getId(), m.getPlo().getId(), m.getLevel()))
                .toList();

        return new CloPloMatrixRes(scopeKey, ploDtos, cloDtos, cells);
    }

    @Override
    @Transactional
    public void saveMatrix(Long syllabusId, CloPloMatrixSaveReq req) {
        if (req == null) throw new IllegalArgumentException("Body is required");
        if (req.scopeKey() == null || req.scopeKey().isBlank()) throw new IllegalArgumentException("scopeKey is required");
        if (req.cells() == null) throw new IllegalArgumentException("cells is required");

        Syllabus s = syllabusRepo.findById(syllabusId)
                .orElseThrow(() -> new IllegalArgumentException("Syllabus not found: " + syllabusId));
        if (!EDITABLE.contains(s.getStatus())) {
            throw new IllegalStateException("Syllabus is not editable in status: " + s.getStatus());
        }

        // Xóa mapping cũ theo syllabus
        mapRepo.deleteByCloSyllabusId(syllabusId);

        if (req.cells().isEmpty()) return;

        // chuẩn hóa: chỉ cho phép clo thuộc syllabusId, plo thuộc scopeKey
        Map<Long, Clo> cloMap = cloRepo.findBySyllabusIdOrderByCodeAsc(syllabusId)
                .stream().collect(java.util.stream.Collectors.toMap(Clo::getId, x -> x));

        Set<Long> allowedPloIds = new HashSet<>(
                ploRepo.findByScopeKeyAndActiveTrueOrderByCodeAsc(req.scopeKey())
                        .stream().map(Plo::getId).toList()
        );

        List<CloPloMap> toSave = new ArrayList<>();

        for (MatrixCellDto cell : req.cells()) {
            if (cell.cloId() == null || cell.ploId() == null) continue;

            Clo clo = cloMap.get(cell.cloId());
            if (clo == null) continue; // clo không thuộc syllabus => bỏ

            if (!allowedPloIds.contains(cell.ploId())) continue; // plo không thuộc scope => bỏ

            Plo ploRef = ploRepo.getReferenceById(cell.ploId());

            CloPloMap m = new CloPloMap();
            m.setClo(clo);
            m.setPlo(ploRef);
            m.setLevel(cell.level());
            toSave.add(m);
        }

        if (!toSave.isEmpty()) {
            mapRepo.saveAll(toSave);
        }
    }
}
