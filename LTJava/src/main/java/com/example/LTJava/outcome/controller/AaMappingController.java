package com.example.LTJava.outcome.controller;

import com.example.LTJava.outcome.dto.MapCloPloRequest;
import com.example.LTJava.outcome.dto.MappingStatus;
import com.example.LTJava.outcome.dto.UpdateMappingStatusRequest;
import com.example.LTJava.outcome.entity.CLO;
import com.example.LTJava.outcome.entity.CLOPLO;
import com.example.LTJava.outcome.entity.PLO;
import com.example.LTJava.outcome.repository.CLOPLORepository;
import com.example.LTJava.outcome.repository.CLORepository;
import com.example.LTJava.outcome.repository.PLORepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aa/outcomes")
@PreAuthorize("hasRole('AA')")
public class AaMappingController {

    private final CLORepository cloRepository;
    private final PLORepository ploRepository;
    private final CLOPLORepository cloploRepository;

    public AaMappingController(
            CLORepository cloRepository,
            PLORepository ploRepository,
            CLOPLORepository cloploRepository
    ) {
        this.cloRepository = cloRepository;
        this.ploRepository = ploRepository;
        this.cloploRepository = cloploRepository;
    }

    /* ====================== XEM MAPPING ====================== */

    @GetMapping("/syllabus/{syllabusId}/map")
    public List<CLOPLO> getMappingBySyllabus(@PathVariable Long syllabusId) {
        return cloploRepository.findByClo_Syllabus_Id(syllabusId);
    }

    /* ====================== MAP ====================== */

    @PostMapping("/map")
    public CLOPLO map(@RequestBody MapCloPloRequest req) {
        CLO clo = cloRepository.findById(req.getCloId())
                .orElseThrow(() -> new RuntimeException("CLO not found"));

        PLO plo = ploRepository.findById(req.getPloId())
                .orElseThrow(() -> new RuntimeException("PLO not found"));

        if (cloploRepository.existsByCloAndPlo(clo, plo)) {
            throw new RuntimeException("Mapping already exists");
        }

        CLOPLO mapping = new CLOPLO();
        mapping.setClo(clo);
        mapping.setPlo(plo);
        mapping.setStatus(MappingStatus.PENDING);

        return cloploRepository.save(mapping);
    }

    /* ====================== UNMAP ====================== */

    @DeleteMapping("/map")
    @Transactional
    public void unmap(@RequestBody MapCloPloRequest req) {

        CLOPLO mapping = cloploRepository
                .findByClo_IdAndPlo_Id(req.getCloId(), req.getPloId())
                .orElseThrow(() -> new RuntimeException("Mapping not found"));

        cloploRepository.delete(mapping);
    }

    /* ====================== APPROVE / REJECT ====================== */

    @PatchMapping("/map/status")
    public CLOPLO updateStatus(@RequestBody UpdateMappingStatusRequest req) {
        CLOPLO mapping = cloploRepository
                .findByClo_IdAndPlo_Id(req.getCloId(), req.getPloId())
                .orElseThrow(() -> new RuntimeException("Mapping not found"));

        mapping.setStatus(req.getStatus());
        mapping.setNote(req.getNote());

        return cloploRepository.save(mapping);
    }
}


