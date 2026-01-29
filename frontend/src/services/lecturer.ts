import { api } from "./api";
import type { CreateSyllabusRequest, Syllabus, SyllabusHistory, SyllabusStatus } from "./syllabus";

export interface CourseOutcomesPayload {
    generalInfo: Record<string, string>;
    description: string;
    courseObjectives: string[];
    courseLearningOutcomes: Array<{ code: string; description: string }>;
    assessmentMethods: Array<{ component: string; method: string; clos: string; criteria: string }>; // ✅ bỏ weight
    studentDuties: string;
    teachingPlan: Array<{ week: string; chapter: string; content: string; clos: string; teaching: string; assessment: string }>;
    cloMappings: Array<{ clo: string; plo: string; level: number | null }>;
}

// BE trả entity với các cột JSON dạng string => parse an toàn
function safeJsonParse<T>(v: any, fallback: T): T {
    if (v === null || v === undefined) return fallback;
    if (typeof v !== "string") return v as T; // sau này BE đổi trả object vẫn ok
    try {
        return JSON.parse(v) as T;
    } catch {
        return fallback;
    }
}

export const lecturerApi = {
    createSyllabus: (payload: CreateSyllabusRequest) => {
        const body: any = {
            ...payload,
            // ✅ đảm bảo không null
            aiSummary: (payload as any)?.aiSummary ?? "",
            keywords: (payload as any)?.keywords ?? "",
        };
        return api.post<Syllabus>("/lecturer/syllabus", body).then((r) => r.data);
    },

    updateSyllabus: (id: number, payload: CreateSyllabusRequest) => {
        const body: any = {
            ...payload,
            aiSummary: (payload as any)?.aiSummary ?? "",
            keywords: (payload as any)?.keywords ?? "",
        };
        return api.put<Syllabus>(`/lecturer/syllabus/${id}`, body).then((r) => r.data);
    },


    deleteSyllabus: (id: number) =>
        api.delete<void>(`/lecturer/syllabus/${id}`).then((r) => r.data),

    detail: (id: number) =>
        api.get<Syllabus>(`/lecturer/syllabus/${id}`).then((r) => r.data),

    createNewVersion: (id: number) =>
        api.post<Syllabus>(`/lecturer/syllabus/${id}/new-version`).then((r) => r.data),

    // ✅ save: gửi payload sạch (không weight)
    saveCourseOutcomes: (syllabusId: number, payload: CourseOutcomesPayload) => {
        const clean: CourseOutcomesPayload = {
            ...payload,
            generalInfo: payload.generalInfo ?? {},
            description: payload.description ?? "",
            courseObjectives: Array.isArray(payload.courseObjectives) ? payload.courseObjectives : [],
            courseLearningOutcomes: Array.isArray(payload.courseLearningOutcomes) ? payload.courseLearningOutcomes : [],
            assessmentMethods: Array.isArray(payload.assessmentMethods)
                ? payload.assessmentMethods.map((m: any) => ({
                    component: m?.component ?? "",
                    method: m?.method ?? "",
                    clos: m?.clos ?? "",
                    criteria: m?.criteria ?? "",
                }))
                : [],
            studentDuties: payload.studentDuties ?? "",
            teachingPlan: Array.isArray(payload.teachingPlan) ? payload.teachingPlan : [],
            cloMappings: Array.isArray(payload.cloMappings) ? payload.cloMappings : [],
        };

        return api.put(`/lecturer/syllabus/${syllabusId}/content`, clean).then((r) => r.data);
    },

    // ✅ get: parse JSON string từ BE thành object/array cho FE dùng
    getCourseOutcomes: async (syllabusId: number): Promise<CourseOutcomesPayload> => {
        const { data } = await api.get<any>(`/lecturer/syllabus/${syllabusId}/content`);

        return {
            generalInfo: safeJsonParse<Record<string, string>>(data?.generalInfo, {}),
            description: data?.description ?? "",
            courseObjectives: safeJsonParse<string[]>(data?.courseObjectives, []),
            courseLearningOutcomes: safeJsonParse<Array<{ code: string; description: string }>>(data?.courseLearningOutcomes, []),
            assessmentMethods: safeJsonParse<Array<{ component: string; method: string; clos: string; criteria: string }>>(data?.assessmentMethods, []),
            studentDuties: data?.studentDuties ?? "",
            teachingPlan: safeJsonParse<Array<{ week: string; chapter: string; content: string; clos: string; teaching: string; assessment: string }>>(data?.teachingPlan, []),
            cloMappings: safeJsonParse<Array<{ clo: string; plo: string; level: number | null }>>(data?.cloMappings, []),
        };
    },

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

    getHistory: (syllabusId: number) =>
        api.get<SyllabusHistory[]>(`/lecturer/syllabus/${syllabusId}/history`).then((r) => r.data),

    compareVersions: (syllabusId: number, historyId: number) =>
        api.get<string[]>(`/lecturer/syllabus/${syllabusId}/compare/${historyId}`).then((r) => r.data),
};

// backward compatible
export const createSyllabus = lecturerApi.createSyllabus;
export const submitSyllabus = lecturerApi.submit;
export const resubmitSyllabus = lecturerApi.resubmit;
export const moveToDraft = lecturerApi.moveToDraft;
export const getMySyllabi = lecturerApi.mySyllabi;

export type { Syllabus, SyllabusStatus };
