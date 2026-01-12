import {api} from "./api";

export type SyllabusStatus =
    | "DRAFT"
    | "SUBMITTED"
    | "HOD_APPROVED"
    | "AA_APPROVED"
    | "PUBLISHED"
    | "REQUESTEDIT"
    | "REJECTED";

export type Syllabus = any;

export async function aaListSyllabusByStatus(status: SyllabusStatus) {
    const res = await api.get(`/aa/syllabus`, { params: { status } });
    return res.data;
}

export async function aaApproveSyllabus(id: number) {
    return api.put(`/aa/syllabus/${id}/approve`);
}

export async function aaPublishSyllabus(id: number) {
    return api.put(`/aa/syllabus/${id}/publish`);
}

export async function aaRejectSyllabus(id: number, note?: string) {
    return api.put(`/aa/syllabus/${id}/reject`, note ? { note } : {});
}
