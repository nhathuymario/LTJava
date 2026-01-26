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
        List<Clo> clos = cloRepo.findBySyllabus_IdOrderByCodeAsc(syllabusId);

        // plos theo scope
        List<Plo> plos = ploRepo.findByScopeKeyAndActiveTrueOrderByCodeAsc(scopeKey);

        // mapping theo syllabus
        List<CloPloMap> maps = mapRepo.findByClo_Syllabus_Id(syllabusId);

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

        // Upsert + prune instead of blanket delete to avoid race conditions
        if (req.cells().isEmpty()) {
            // If empty, remove all existing mappings for this syllabus
            mapRepo.deleteAllBySyllabusId(syllabusId);
            return;
        }

        // chuẩn hóa: chỉ cho phép clo thuộc syllabusId, plo thuộc scopeKey
        Map<Long, Clo> cloMap = cloRepo.findBySyllabus_IdOrderByCodeAsc(syllabusId)
                .stream().collect(java.util.stream.Collectors.toMap(Clo::getId, x -> x));

        Set<Long> allowedPloIds = new HashSet<>(
                ploRepo.findByScopeKeyAndActiveTrueOrderByCodeAsc(req.scopeKey())
                        .stream().map(Plo::getId).toList()
        );

        // Deduplicate pairs (cloId, ploId); last entry wins for level
        Map<String, Integer> pairToLevel = new LinkedHashMap<>();

        for (MatrixCellDto cell : req.cells()) {
            if (cell.cloId() == null || cell.ploId() == null) continue;

            Clo clo = cloMap.get(cell.cloId());
            if (clo == null) continue; // clo không thuộc syllabus => bỏ

            if (!allowedPloIds.contains(cell.ploId())) continue; // plo không thuộc scope => bỏ

            String key = clo.getId() + ":" + cell.ploId();
            pairToLevel.put(key, cell.level());
        }

        if (!pairToLevel.isEmpty()) {
            // Load existing mappings for syllabus
            List<CloPloMap> existing = mapRepo.findByClo_Syllabus_Id(syllabusId);
            Map<String, CloPloMap> existingByPair = new HashMap<>();
            for (CloPloMap m : existing) {
                existingByPair.put(m.getClo().getId() + ":" + m.getPlo().getId(), m);
            }

            List<CloPloMap> mapsToUpsert = new ArrayList<>();
            Set<String> desiredPairs = pairToLevel.keySet();

            for (Map.Entry<String, Integer> e : pairToLevel.entrySet()) {
                String pair = e.getKey();
                Integer lvl = e.getValue();
                CloPloMap m = existingByPair.get(pair);
                if (m == null) {
                    String[] parts = pair.split(":", 2);
                    Long cloId = Long.parseLong(parts[0]);
                    Long ploId = Long.parseLong(parts[1]);
                    m = new CloPloMap();
                    m.setClo(cloRepo.getReferenceById(cloId));
                    m.setPlo(ploRepo.getReferenceById(ploId));
                }
                m.setLevel(lvl);
                mapsToUpsert.add(m);
            }

            List<CloPloMap> toDelete = new ArrayList<>();
            for (Map.Entry<String, CloPloMap> en : existingByPair.entrySet()) {
                if (!desiredPairs.contains(en.getKey())) {
                    toDelete.add(en.getValue());
                }
            }

            if (!toDelete.isEmpty()) mapRepo.deleteAllInBatch(toDelete);
            if (!mapsToUpsert.isEmpty()) mapRepo.saveAll(mapsToUpsert);
        }
    }
}
