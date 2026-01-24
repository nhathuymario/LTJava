package com.example.LTJava.outcome.service;

import com.example.LTJava.outcome.dto.CloPloMatrixRes;
import com.example.LTJava.outcome.dto.CloPloMatrixSaveReq;

public interface MatrixService {
    CloPloMatrixRes getMatrix(Long syllabusId, String scopeKey);
    void saveMatrix(Long syllabusId, CloPloMatrixSaveReq req);
}
