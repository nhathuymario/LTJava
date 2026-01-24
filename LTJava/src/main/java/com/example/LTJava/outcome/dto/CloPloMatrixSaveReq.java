package com.example.LTJava.outcome.dto;

import java.util.List;

public record CloPloMatrixSaveReq(
        String scopeKey,
        List<MatrixCellDto> cells
) {}
