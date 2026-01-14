package com.example.LTJava.syllabus.entity;

public enum SyllabusStatus {
    DRAFT,          // Giảng viên đang soạn
    SUBMITTED, // Đã gửi HoD
    HOD_APPROVED,
    AA_APPROVED,         // AA duyệt học thuật
    PRINCIPAL_APPROVED,  // Principal duyệt cuối
    PUBLISHED,
    REQUESTEDIT, //Yêu cầu chỉnh sửa
    REJECTED  // từ chối xuất bản
}
