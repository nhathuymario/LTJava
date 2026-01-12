// src/services/lecturer.ts
import { api } from "./api";

/* ======================
 * TYPES
 * ====================== */

export type SyllabusStatus =
    | "DRAFT"
    | "SUBMITTED"
    | "REQUESTEDIT"
    | "REJECTED";

export type Syllabus = {
    id: number;
    title: string;
    description?: string;
    academicYear?: string;
    semester?: string;
    version?: number;
    status: SyllabusStatus;
    editNote?: string | null;
};

export type CreateSyllabusRequest = {
    courseId: number;
    title: string;
    description?: string;
    academicYear?: string;
    semester?: string;
};

/* ======================
 * LECTURER APIs
 * ====================== */

/** Tạo syllabus (DRAFT) */
export async function createSyllabus(
    body: CreateSyllabusRequest
): Promise<Syllabus> {
    const { data } = await api.post("/syllabus/create", body);
    return data;
}

/** Submit: DRAFT -> SUBMITTED */
export async function submitSyllabus(id: number): Promise<Syllabus> {
    const { data } = await api.put(`/syllabus/${id}/submit`);
    return data;
}

/** Resubmit: REQUESTEDIT/REJECTED -> SUBMITTED */
export async function resubmitSyllabus(id: number): Promise<Syllabus> {
    const { data } = await api.put(`/syllabus/${id}/resubmit`);
    return data;
}

/** Xem syllabus của chính mình */
export async function getMySyllabus(): Promise<Syllabus[]> {
    const { data } = await api.get("/syllabus/my");
    return data;
}

/** Xem syllabus theo course */
export async function getSyllabusByCourse(
    courseId: number
): Promise<Syllabus[]> {
    const { data } = await api.get(`/syllabus/course/${courseId}`);
    return data;
}
