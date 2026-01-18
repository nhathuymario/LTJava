import { api } from "./api";
import type { Syllabus, Notification } from "./syllabus";

/** Dạng gọn để tránh lồng quá sâu khi course có quan hệ course-course */
export type CourseMini = {
    id: number;
    code?: string;
    name?: string;
};

export type Course = {
    id: number;
    code?: string;
    name?: string;
    department?: string;

    // ✅ NEW: lọc theo năm học / học kỳ (backend bạn thêm vào Course)
    academicYear?: string; // "2025-2026"
    semester?: string; // "1" | "2" | "Summer"...

    // ✅ NEW: quan hệ (tiên quyết / song hành / bổ trợ)
    prerequisites?: CourseMini[];
    parallelCourses?: CourseMini[];
    supplementaryCourses?: CourseMini[];
};

export const studentApi = {
    myCourses: () => api.get<Course[]>("/student/syllabus/my-courses").then((r) => r.data),

    publishedByCourse: (courseId: number) =>
        api.get<Syllabus[]>(`/student/syllabus/course/${courseId}`).then((r) => r.data),

    // ✅ NEW: available courses có params lọc
    availableCourses: (params?: { academicYear?: string; semester?: string }) =>
        api.get<Course[]>("/student/syllabus/available", { params }).then((r) => r.data),

    detail: (id: number) => api.get<Syllabus>(`/student/syllabus/${id}`).then((r) => r.data),

    subscribeCourse: (courseId: number) =>
        api.post<string>(`/student/syllabus/subscribe/${courseId}`).then((r) => r.data),

    notifications: () => api.get<Notification[]>("/student/syllabus/notifications").then((r) => r.data),
};
