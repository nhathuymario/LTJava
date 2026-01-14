package com.example.LTJava.syllabus.service;

import java.util.List;

import com.example.LTJava.syllabus.dto.CreateSyllabusRequest;
import com.example.LTJava.syllabus.entity.Notification;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.SyllabusHistory;
import com.example.LTJava.syllabus.entity.SyllabusStatus;

public interface SyllabusService {

    // =========================
    // 1) LECTURER
    // =========================
    Syllabus createSyllabus(CreateSyllabusRequest request, Long lecturerId);
    Syllabus submitSyllabus(Long syllabusId, Long lecturerId);
    Syllabus resubmitSyllabus(Long syllabusId, Long lecturerId);
    Syllabus moveToDraftForEdit(Long syllabusId, Long lecturerId);
    List<Syllabus> getMySyllabus(Long lecturerId);

    // =========================
    // 2) QUERY
    // =========================
    List<Syllabus> getAll();
    Syllabus getById(Long id);
    List<Syllabus> getByCourseId(Long courseId);
    List<Syllabus> getByStatus(SyllabusStatus status);

    // (Nếu bạn đang dùng ở FE thì giữ, còn không có thể bỏ vì trùng getByStatus)
    List<Syllabus> getSyllabusByStatus(SyllabusStatus status);

    // =========================
    // 3) HOD (SUBMITTED -> HOD_APPROVED / REQUEST_EDIT / REJECTED)
    // =========================
    Syllabus approveByHod(Long syllabusId, Long hodId);
    Syllabus requestEditByHod(Long syllabusId, Long hodId, String editNote);
    Syllabus rejectByHod(Long syllabusId, Long hodId, String reason);

    // =========================
    // 4) AA (HOD_APPROVED -> AA_APPROVED / REJECTED)
    // =========================
    Syllabus approveByAa(Long syllabusId, Long aaId);
    Syllabus rejectByAa(Long syllabusId, Long aaId, String reason);

    // =========================
    // 5) PRINCIPAL (AA_APPROVED -> PRINCIPAL_APPROVED / REJECTED)
    // =========================
    Syllabus approveByPrincipal(Long syllabusId, Long principalId);
    Syllabus rejectByPrincipal(Long syllabusId, Long principalId, String reason);

    // =========================
    // 6) PUBLISH (PRINCIPAL_APPROVED -> PUBLISHED)
    // =========================
    Syllabus publish(Long syllabusId, Long principalId);

    // =========================
    // 7) STUDENT (PUBLIC)
    // =========================
    List<Syllabus> searchSyllabus(String keyword, String year, String semester);
    Syllabus getSyllabusDetailPublic(Long id);

    // =========================
    // 8) HISTORY / VERSIONING
    // =========================
    List<SyllabusHistory> getHistory(Long syllabusId);
    List<String> compareVersions(Long syllabusId, Long historyId);

    // =========================
    // 9) SUBSCRIBE / NOTIFICATION
    // =========================
    void subscribeCourse(Long userId, Long courseId);
    List<Notification> getMyNotifications(Long userId);
}
