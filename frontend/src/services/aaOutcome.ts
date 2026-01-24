import { api } from "./api";
import type { CLO, PLO, CLOPLO } from "./outcome";

export type MappingStatus = "PENDING" | "APPROVED" | "REJECTED";

export const aaOutcomeApi = {
    // Nếu bạn đã có endpoint AA cho CLO theo syllabus thì đổi path ở đây
    getCLOBySyllabus: (syllabusId: number): Promise<CLO[]> =>
        api.get(`/lecturer/outcomes/syllabus/${syllabusId}/clo`).then((r) => r.data),

    getAllPLO: (): Promise<PLO[]> =>
        api.get(`/aa/plo`).then((r) => r.data),

    getMappingBySyllabus: (syllabusId: number): Promise<CLOPLO[]> =>
        api.get(`/aa/outcomes/syllabus/${syllabusId}/map`).then((r) => r.data),

    mapCloPlo: (data: { cloId: number; ploId: number }): Promise<CLOPLO> =>
        api.post(`/aa/outcomes/map`, data).then((r) => r.data),

    unmapCloPlo: (data: { cloId: number; ploId: number }): Promise<void> =>
        api.delete(`/aa/outcomes/map`, { data }).then((r) => r.data),

    updateMappingStatus: (data: {
        cloId: number;
        ploId: number;
        status: MappingStatus;
        note?: string;
    }): Promise<CLOPLO> => api.patch(`/aa/outcomes/map/status`, data).then((r) => r.data),
};
