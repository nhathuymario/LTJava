package com.example.LTJava.outcome.repository;

import com.example.LTJava.outcome.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PloRepo extends JpaRepository<Plo, Long> {
    List<Plo> findByScopeKeyAndActiveTrueOrderByCodeAsc(String scopeKey);
}

