package com.example.LTJava.outcome.dto;

import java.util.List;

public record CloPloMatrixRes(
        String scopeKey,
        List<PloDto> plos,
        List<CloDto> clos,
        List<MatrixCellDto> cells
) {}
