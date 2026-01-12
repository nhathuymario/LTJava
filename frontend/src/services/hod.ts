import {api} from "./api"; // giống các service khác của bạn

export type SyllabusStatus =
    | "DRAFT"
    | "SUBMITTED"
    | "HOD_APPROVED"
    | "AA_APPROVED"
    | "PUBLISHED"
    | "REQUESTEDIT"
    | "REJECTED";

// bạn có thể dùng type Syllabus hiện có trong services/syllabus nếu đã chuẩn
export type Syllabus = any;

export async function hodListSyllabusByStatus(status: SyllabusStatus) {
    const res = await api.get(`/hod/syllabus`, { params: { status } });
    return res.data;
}

export async function hodApproveSyllabus(id: number) {
    return api.put(`/hod/syllabus/${id}/approve`);
}

export async function hodRequestEditSyllabus(id: number, note: string) {
    return api.put(`/hod/syllabus/${id}/request-edit`, { note });
}

export async function hodRejectSyllabus(id: number, note?: string) {
    return api.put(`/hod/syllabus/${id}/reject`, note ? { note } : {});
}
