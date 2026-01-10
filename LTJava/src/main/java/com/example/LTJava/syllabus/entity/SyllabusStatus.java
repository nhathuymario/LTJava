package com.example.LTJava.syllabus.entity;

public enum SyllabusStatus {
    DRAFT,          // Giảng viên đang soạn
    SUBMITTED,      // Đã gửi HoD
    APPROVED,       // HoD/Approver đã duyệt
    PUBLISHED, // Đã xuất bản cho SV xem
    REQUESTEDIT, //Yêu cầu chỉnh sửa
    REJECTED  // từ chối xuất bản
}
