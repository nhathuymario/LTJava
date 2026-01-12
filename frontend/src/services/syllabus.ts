import { api } from "./api";

export type SyllabusStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "PUBLISHED" | "REQUESTED_EDIT" | "REJECTED";

export type Syllabus = {
    id: number;
    title: string;
    description?: string;
    status?: SyllabusStatus;
    note?: string;
};

export async function submitSyllabusApi(id: number) {
    return api.post(`/syllabi/${id}/submit`);
}


export async function getSyllabusByCourse(courseId: number): Promise<Syllabus[]> {
    // nếu baseURL api.ts = http://localhost:8081/api => "/syllabus/course/{id}"
    // nếu baseURL = http://localhost:8081          => "/api/syllabus/course/{id}"
    const { data } = await api.get(`/syllabus/course/${courseId}`);
    return data;
}
