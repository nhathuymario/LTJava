package com.example.LTJava.outcome.controller;

import com.example.LTJava.outcome.dto.CreatePLORequest;
import com.example.LTJava.outcome.entity.PLO;
import com.example.LTJava.outcome.service.PLOService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aa/plo")
@PreAuthorize("hasRole('AA')")
public class AaPLOController {

    private final PLOService ploService;

    public AaPLOController(PLOService ploService) {
        this.ploService = ploService;
    }

    @PostMapping
    public PLO create(@RequestBody CreatePLORequest req) {
        return ploService.create(req);
    }

    @GetMapping
    public List<PLO> getAll() {
        return ploService.getAll();
    }

    @PutMapping("/{id}")
    public PLO updatePlo(
            @PathVariable Long id,
            @RequestBody CreatePLORequest req
    ) {
        return ploService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void deletePlo(@PathVariable Long id) {
        ploService.delete(id);
    }

}

