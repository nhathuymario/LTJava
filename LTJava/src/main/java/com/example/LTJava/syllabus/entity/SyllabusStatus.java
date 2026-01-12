package com.example.LTJava.syllabus.entity;

public enum SyllabusStatus {
    DRAFT,          // Giảng viên đang soạn
    SUBMITTED,      // Đã gửi HoD
    HOD_APPROVED, // HoD/Approver đã duyệt
    AA_APPROVED,        // AA đã duyệt (chờ publish)
    PUBLISHED, // AA Đã xuất bản cho SV xem
    REQUESTEDIT, //Yêu cầu chỉnh sửa
    REJECTED  // từ chối xuất bản
}
