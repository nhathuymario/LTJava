package com.example.LTJava.syllabus.service;

import com.example.LTJava.syllabus.dto.CreateSyllabusRequest;
import com.example.LTJava.syllabus.entity.Syllabus;

import java.util.List;

public interface SyllabusService {

    // --- 1. PHẦN CỦA GIẢNG VIÊN ---

    // Tạo giáo trình (Giữ nguyên logic cũ của bạn)
    Syllabus createSyllabus(CreateSyllabusRequest request, Long lecturerId);

    // Lấy giáo trình của tôi
    List<Syllabus> getMySyllabus(Long id);

    // Nộp bài (Cập nhật thành 1 tham số ID cho gọn, khớp với code Impl mới)
    Syllabus submitSyllabus(Long syllabusId, Long lecturerId);

    // (Nếu bạn có chức năng nộp lại, giữ nguyên dòng này, nếu không thì xóa)
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


    // --- 3. PHẦN CỦA SINH VIÊN ---

    // Tìm kiếm nâng cao (3 tham số: keyword, năm, kỳ)
    // (Đây là hàm thay thế hoàn toàn cho searchSyllabusPublic cũ)
    List<Syllabus> searchSyllabus(String keyword, String year, String semester);

    // Xem chi tiết
    Syllabus getSyllabusDetailPublic(Long id);
}