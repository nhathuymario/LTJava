package com.example.LTJava.syllabus.service;

import com.example.LTJava.syllabus.dto.CreateSyllabusRequest;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.SyllabusHistory;
import com.example.LTJava.syllabus.entity.Notification;

import java.util.List;

public interface SyllabusService {

    // --- 1. PHẦN CỦA GIẢNG VIÊN ---

    // Tạo giáo trình
    Syllabus createSyllabus(CreateSyllabusRequest request, Long lecturerId);

    // Lấy giáo trình của tôi
    List<Syllabus> getMySyllabus(Long id);

    // Nộp bài (Cập nhật thành 1 tham số ID cho gọn, khớp với code Impl mới)
    Syllabus submitSyllabus(Long syllabusId, Long lecturerId);

    Syllabus resubmitSyllabus(Long syllabusId, Long lecturerId);


    // --- 2. PHẦN CỦA ROLE AA ---

    // Lấy danh sách chờ duyệt (Pending)
    List<Syllabus> getPendingSyllabus();

    // Duyệt bài (Publish)
    // Lưu ý: Nếu bên Impl bạn đặt tên là approveSyllabusByAA thì sửa ở đây cho giống
    // Nhưng mình khuyên dùng tên publishSyllabus cho thống nhất với Controller
    Syllabus publishSyllabus(Long id);

    // Từ chối bài (Reject)
    Syllabus rejectSyllabus(Long id, String reason);

    // 1. Lấy lịch sử
    List<SyllabusHistory> getHistory(Long syllabusId);

    // 2. So sánh phiên bản
    List<String> compareVersions(Long syllabusId, Long historyId);


    // --- 3. PHẦN CỦA SINH VIÊN ---

    // Tìm kiếm nâng cao (3 tham số: keyword, năm, kỳ)
    // (Đây là hàm thay thế hoàn toàn cho searchSyllabusPublic cũ)
    List<Syllabus> searchSyllabus(String keyword, String year, String semester);

    // Xem chi tiết
    Syllabus getSyllabusDetailPublic(Long id);

    // 1. Đăng ký theo dõi môn học
    void subscribeCourse(Long userId, Long courseId);

    // 2. Lấy danh sách thông báo
    List<Notification> getMyNotifications(Long userId);
}