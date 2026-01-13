package com.example.LTJava.syllabus.service;

import java.util.List;

import com.example.LTJava.syllabus.dto.CreateSyllabusRequest;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.SyllabusStatus;

public interface SyllabusService {

    // LECTURER
    Syllabus createSyllabus(CreateSyllabusRequest request, Long lecturerId);
    Syllabus submitSyllabus(Long syllabusId, Long lecturerId);
    Syllabus resubmitSyllabus(Long syllabusId, Long lecturerId);
    Syllabus moveToDraftForEdit(Long syllabusId, Long lecturerId);
    List<Syllabus> getMySyllabus(Long lecturerId);
    List<Syllabus> getSyllabusByStatus(SyllabusStatus status );

    // QUERY
    List<Syllabus> getAll();
    Syllabus getById(Long id);
    List<Syllabus> getByCourseId(Long courseId);
    List<Syllabus> getByStatus(SyllabusStatus status);

    // HOD
    Syllabus approveSyllabus(Long syllabusId, Long hodId);
    Syllabus requestEditSyllabus(Long syllabusId, Long hodId, String editNote);
    Syllabus rejectByHod(Long syllabusId, Long hodId, String reason);

    // AA
    Syllabus approveByAa(Long syllabusId, Long aaId);
    Syllabus publish(Long syllabusId, Long aaId);

    // ✅ nếu bạn muốn AA reject thì PHẢI có dòng này
    Syllabus rejectByAa(Long syllabusId, Long aaId, String reason);

    // --- 3. PHẦN CỦA SINH VIÊN ---

    // Tìm kiếm nâng cao (3 tham số: keyword, năm, kỳ)
    // (Đây là hàm thay thế hoàn toàn cho searchSyllabusPublic cũ)
    List<Syllabus> searchSyllabus(String keyword, String year, String semester);

    // Xem chi tiết
    Syllabus getSyllabusDetailPublic(Long id);
}
