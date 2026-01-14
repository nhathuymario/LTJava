
import { api } from "./api";
import type { NoteRequest, Syllabus, SyllabusStatus } from "./syllabus";

export const aaApi = {
    listByStatus: (status: SyllabusStatus) =>
        api.get<Syllabus[]>("/aa/syllabus", { params: { status } }).then((r) => r.data),

    approve: (id: number) =>
        api.put<Syllabus>(`/aa/syllabus/${id}/approve`).then((r) => r.data),

    reject: (id: number, reason?: string) =>
        api.put<Syllabus>(`/aa/syllabus/${id}/reject`, reason ? ({ note: reason } satisfies NoteRequest) : {}).then((r) => r.data),
};

// backward compatible (nếu page cũ còn dùng)
export const aaListSyllabusByStatus = aaApi.listByStatus;
export const aaApproveSyllabus = aaApi.approve;
export const aaRejectSyllabus = aaApi.reject;

export type { Syllabus, SyllabusStatus };
