import { api } from "./api"
import type { Syllabus, Notification } from "./syllabus"

export type CourseRef = {
    id: number
    code?: string
    name?: string
}

export type Course = {
    id: number
    code?: string
    name?: string
    department?: string

    // ✅ NEW (sau khi backend course có)
    academicYear?: string
    semester?: string

    // ✅ OPTIONAL (nếu backend trả về quan hệ course)
    prerequisites?: CourseRef[]
    parallelCourses?: CourseRef[]
    supplementaryCourses?: CourseRef[]
}

export const studentApi = {
    myCourses: () => api.get<Course[]>("/student/syllabus/my-courses").then((r) => r.data),

    publishedByCourse: (courseId: number) =>
        api.get<Syllabus[]>(`/student/syllabus/course/${courseId}`).then((r) => r.data),

    availableCourses: (params?: { academicYear?: string; semester?: string }) =>
        api.get<Course[]>("/student/syllabus/available", { params }).then((r) => r.data),

    detail: (id: number) => api.get<Syllabus>(`/student/syllabus/${id}`).then((r) => r.data),

    subscribeCourse: (courseId: number) =>
        api.post<string>(`/student/syllabus/subscribe/${courseId}`).then((r) => r.data),

    notifications: () => api.get<Notification[]>("/student/syllabus/notifications").then((r) => r.data),
}
