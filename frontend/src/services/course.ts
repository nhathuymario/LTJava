import { api } from "./api";

/** Dạng gọn để hiển thị quan hệ course-course */
export type CourseMini = {
    id: number;
    code?: string;
    name?: string;
};

export type Course = {
    id: number;
    code: string;
    name: string;
    credits?: number;
    department?: string;
    lecturerId?: number;
    lecturerUsername?: string;

    // ✅ NEW: năm học / học kỳ (backend bạn thêm vào Course)
    academicYear?: string; // "2025-2026"
    semester?: string; // "1" | "2" | "Summer"...

    // ✅ NEW: quan hệ (để UI AA xem được đã set chưa)
    prerequisites?: CourseMini[];
    parallelCourses?: CourseMini[];
    supplementaryCourses?: CourseMini[];
};

export type CreateCoursePayload = {
    code: string;
    name: string;
    credits: number;
    department: string;
    lecturerUsername: string;

    // ✅ NEW (tạm để optional để không phá form cũ; sau bạn có thể bắt buộc)
    academicYear?: string;
    semester?: string;
};

export type AssignLecturerRequest = {
    lecturerId?: number;
    lecturerUsername?: string;
};

export async function getCourseById(id: number): Promise<Course> {
    const { data } = await api.get<Course>(`/course/${id}`);
    return data;
}

export async function createCourse(payload: CreateCoursePayload) {
    const { data } = await api.post("/course/create", payload);
    return data;
}

export async function assignLecturer(courseId: number, req: AssignLecturerRequest): Promise<Course> {
    const { data } = await api.put<Course>(`/course/${courseId}/assign`, req);
    return data;
}

export async function getAllCourses(): Promise<Course[]> {
    const { data } = await api.get<Course[]>("/course");
    return data;
}

export async function getMyCourses(): Promise<Course[]> {
    const { data } = await api.get<Course[]>("/course/my");
    return data;
}
