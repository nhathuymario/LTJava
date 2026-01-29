package com.example.LTJava.outcome.service;

import com.example.LTJava.outcome.dto.*;

import java.util.List;

public interface PloService {
    List<PloDto> listAll(String scopeKey);
    PloDto create(PloUpsertReq req);
    PloDto update(Long id, PloUpsertReq req);
    void softDelete(Long id);

    void hardDelete(Long id);
}
