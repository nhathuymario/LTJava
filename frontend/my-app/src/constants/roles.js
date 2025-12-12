export const ROLES = {
    ADMIN: "ADMIN",
    LECTURER: "LECTURER",
    HOD: "HOD", // Head of Department
    ACADEMIC_AFFAIRS: "ACADEMIC_AFFAIRS",
    RECTOR: "RECTOR",
    STUDENT: "STUDENT",
    USER: "USER" // Fallback/Generic
};

export const ROLE_LABELS = {
    [ROLES.ADMIN]: "Quản trị viên",
    [ROLES.LECTURER]: "Giảng viên",
    [ROLES.HOD]: "Trưởng khoa",
    [ROLES.ACADEMIC_AFFAIRS]: "Giáo vụ",
    [ROLES.RECTOR]: "Hiệu trưởng",
    [ROLES.STUDENT]: "Sinh viên",
    [ROLES.USER]: "Người dùng"
};
