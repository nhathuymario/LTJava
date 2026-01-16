import { api } from "./api";

export type Course = {
    id: number;
    code: string;
    name: string;
    credits?: number;
    department?: string;
    lecturerId?: number;
    // description?: string;
};

export async function getCourseById(id: number): Promise<Course> {
    const { data } = await api.get(`/course/${id}`);
    return data;
}

export async function createCourse(payload: any) {
    // nếu api.ts baseURL đã là /api thì dùng "/course/create"
    const { data } = await api.post("/course/create", payload);
    return data;
}

export async function getMyCourses(): Promise<Course[]> {
    // nếu api.ts baseURL = http://localhost:8081/api  => "/course/my" là đúng
    // nếu baseURL = http://localhost:8081          => đổi thành "/api/course/my"
    const { data } = await api.get("/course/my");
    return data;
}
