// src/services/syllabus.ts
import { api } from "./api";

/** ✅ Status khớp backend enum */
export type SyllabusStatus =
    | "DRAFT"
    | "SUBMITTED"
    | "HOD_APPROVED"
    | "AA_APPROVED"
    | "PUBLISHED"
    | "REQUESTEDIT"
    | "REJECTED";

export type Course = {
    id: number;
    code?: string;
    name?: string;
    department?: string;
    description?: string;
};

export type User = {
    id: number;
    username?: string;
    fullName?: string;
};

export type Syllabus = {
    id: number;
    title: string;
    description?: string;
    academicYear?: string;
    semester?: string;
    version?: number;
    status: SyllabusStatus;
    editNote?: string | null;

    course?: Course;
    createdBy?: User;
};

export type CreateSyllabusRequest = {
    courseId: number;
    title: string;
    description?: string;
    academicYear?: string;
    semester?: string;
};

export type NoteRequest = { note: string };

/* =========================
 * LECTURER APIs (/api/syllabus)
 * ========================= */

export async function createSyllabus(body: CreateSyllabusRequest): Promise<Syllabus> {
    const { data } = await api.post("/syllabus/create", body);
    return data;
}

export async function submitSyllabus(id: number): Promise<Syllabus> {
    const { data } = await api.put(`/syllabus/${id}/submit`);
    return data;
}

export async function resubmitSyllabus(id: number): Promise<Syllabus> {
    const { data } = await api.put(`/syllabus/${id}/resubmit`);
    return data;
}

/** Lecturer: REQUESTEDIT -> DRAFT (để chỉnh sửa lại) */
export async function moveToDraftForEdit(id: number): Promise<Syllabus> {
    const { data } = await api.put(`/syllabus/${id}/move-to-draft`);
    return data;
}

export async function getMySyllabus(): Promise<Syllabus[]> {
    const { data } = await api.get("/syllabus/my");
    return data;
}

export async function getSyllabusByCourse(courseId: number): Promise<Syllabus[]> {
    const { data } = await api.get(`/syllabus/course/${courseId}`);
    return data;
}




