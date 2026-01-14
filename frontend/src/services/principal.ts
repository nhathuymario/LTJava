
import { api } from "./api";
import type { NoteRequest, Syllabus, SyllabusStatus } from "./syllabus";

export const principalApi = {
    listByStatus: (status: SyllabusStatus) =>
        api.get<Syllabus[]>("/principal/syllabus", { params: { status } }).then((r) => r.data),

    approve: (id: number) =>
        api.put<Syllabus>(`/principal/syllabus/${id}/approve`).then((r) => r.data),

    reject: (id: number, reason?: string) =>
        api.put<Syllabus>(`/principal/syllabus/${id}/reject`, reason ? ({ note: reason } satisfies NoteRequest) : {}).then((r) => r.data),

    publish: (id: number) =>
        api.put<Syllabus>(`/principal/syllabus/${id}/publish`).then((r) => r.data),
};

export type { Syllabus, SyllabusStatus };
