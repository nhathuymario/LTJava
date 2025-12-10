package com.example.LTJava.syllabus.repository;

import com.example.LTJava.syllabus.entity.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
}
