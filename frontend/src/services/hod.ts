// src/services/hod.ts
import { api } from "./api";
import type { NoteRequest, Syllabus, SyllabusStatus } from "./syllabus";

export type HodCourseGroup = {
    courseId: number;
    code: string;
    name: string;
    department?: string;
    count: number;
};

export const hodApi = {
    listByStatus: (status: SyllabusStatus) =>
        api.get<Syllabus[]>("/hod/syllabus", { params: { status } }).then((r) => r.data),

    approve: (id: number) =>
        api.put<Syllabus>(`/hod/syllabus/${id}/approve`).then((r) => r.data),

    requestEdit: (id: number, note: string) =>
        api.put<Syllabus>(`/hod/syllabus/${id}/request-edit`, { note } satisfies NoteRequest).then((r) => r.data),

    listSyllabiByCourseAndStatus: (courseId: number, status = "DRAFT") =>
        api
            .get<Syllabus[]>(`/hod/syllabus/${courseId}/syllabi`, { params: { status } })
            .then((r) => r.data),

    listCoursesHavingSyllabusStatus: (status = "DRAFT") =>
        api
            .get<HodCourseGroup[]>("/hod/syllabus/courses", {
                params: { syllabusStatus: status },
            })
            .then((r) => r.data),

    reject: (id: number, reason?: string) =>
        api.put<Syllabus>(`/hod/syllabus/${id}/reject`, reason ? ({ note: reason } satisfies NoteRequest) : {}).then((r) => r.data),
};

// backward compatible (để page cũ không crash)
export const hodListSyllabusByStatus = hodApi.listByStatus;
export const hodApproveSyllabus = hodApi.approve;
export const hodRequestEditSyllabus = hodApi.requestEdit;
export const hodRejectSyllabus = hodApi.reject;

export type { Syllabus, SyllabusStatus };
