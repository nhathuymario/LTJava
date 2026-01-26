
import { api } from "./api";
import type { CreateSyllabusRequest, Syllabus, SyllabusHistory, SyllabusStatus } from "./syllabus";

export interface CourseOutcomesPayload {
    generalInfo: Record<string, string>;
    description: string;
    courseObjectives: string[];
    courseLearningOutcomes: Array<{code: string; description: string}>;
    assessmentMethods: Array<{component: string; method: string; clos: string; criteria: string; weight: string}>;
    studentDuties: string;
    teachingPlan: Array<{week: string; chapter: string; content: string; clos: string; teaching: string; assessment: string}>;
    cloMappings: Array<{clo: string; plo: string; level: number | null}>;
}

export const lecturerApi = {
    createSyllabus: (payload: CreateSyllabusRequest) =>
        api.post<Syllabus>("/lecturer/syllabus", payload).then((r) => r.data),

    updateSyllabus: (id: number, payload: CreateSyllabusRequest) =>
        api.put<Syllabus>(`/lecturer/syllabus/${id}`, payload).then((r) => r.data),

    deleteSyllabus: (id: number) =>
        api.delete<void>(`/lecturer/syllabus/${id}`).then((r) => r.data),

    createNewVersion: (id: number) =>
        api.post<Syllabus>(`/lecturer/syllabus/${id}/new-version`).then((r) => r.data),

    saveCourseOutcomes: (syllabusId: number, payload: CourseOutcomesPayload) =>
        api.put<any>(`/lecturer/syllabus/${syllabusId}/content`, payload).then((r) => r.data),

    getCourseOutcomes: (syllabusId: number) =>
        api.get<any>(`/lecturer/syllabus/${syllabusId}/content`).then((r) => r.data),

    mySyllabi: () =>
        api.get<Syllabus[]>("/lecturer/syllabus/my").then((r) => r.data),

    getById: (id: number) =>
        api.get<Syllabus>(`/lecturer/syllabus/${id}`).then((r) => r.data),

    getByCourse: (courseId: number) =>
        api.get<Syllabus[]>(`/lecturer/syllabus/course/${courseId}`).then((r) => r.data),

    getByStatus: (status: SyllabusStatus) =>
        api.get<Syllabus[]>(`/lecturer/syllabus/status/${status}`).then((r) => r.data),

    submit: (id: number) =>
        api.put<Syllabus>(`/lecturer/syllabus/${id}/submit`).then((r) => r.data),

    resubmit: (id: number) =>
        api.put<Syllabus>(`/lecturer/syllabus/${id}/resubmit`).then((r) => r.data),

    moveToDraft: (id: number) =>
        api.put<Syllabus>(`/lecturer/syllabus/${id}/move-to-draft`).then((r) => r.data),

    // nếu bạn có endpoint history/compare thì dùng, không có thì có thể bỏ
    getHistory: (syllabusId: number) =>
        api.get<SyllabusHistory[]>(`/lecturer/syllabus/${syllabusId}/history`).then((r) => r.data),

    compareVersions: (syllabusId: number, historyId: number) =>
        api.get<string[]>(`/lecturer/syllabus/${syllabusId}/compare/${historyId}`).then((r) => r.data),
};

// backward compatible (nếu page cũ còn dùng)
export const createSyllabus = lecturerApi.createSyllabus;
export const submitSyllabus = lecturerApi.submit;
export const resubmitSyllabus = lecturerApi.resubmit;
export const moveToDraft = lecturerApi.moveToDraft;
export const getMySyllabi = lecturerApi.mySyllabi;

export type { Syllabus, SyllabusStatus };
