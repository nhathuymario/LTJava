import { api } from "./api";
import type { CLO, PLO, CLOPLO } from "./outcome";

/* ================================
   DTO
   ================================ */

export interface CreateCLO {
    code: string;
    description: string;
}

export interface MapCloPlo {
    cloId: number;
    ploId: number;
}

/* ================================
   CLO API (LECTURER)
   ================================ */

export const cloApi = {
    /* ===== CLO ===== */

    getCLOBySyllabus: (syllabusId: number): Promise<CLO[]> =>
        api
            .get(`/lecturer/outcomes/syllabus/${syllabusId}/clo`)
            .then((r) => r.data),

    createCLO: (
        syllabusId: number,
        data: CreateCLO
    ): Promise<CLO> =>
        api
            .post(`/lecturer/outcomes/syllabus/${syllabusId}/clo`, data)
            .then((r) => r.data),

    updateCLO: (
        id: number,
        data: CreateCLO
    ): Promise<CLO> =>
        api
            .put(`/lecturer/outcomes/clo/${id}`, data)
            .then((r) => r.data),

    deleteCLO: (id: number): Promise<void> =>
        api.delete(`/lecturer/outcomes/clo/${id}`),

    /* ===== PLO (phục vụ mapping) ===== */

    getAllPLO: (): Promise<PLO[]> =>
        api
            .get(`/lecturer/outcomes/plo`)
            .then((r) => r.data),

    /* ===== CLO ↔ PLO Mapping ===== */

    mapCloPlo: (data: MapCloPlo): Promise<CLOPLO> =>
        api
            .post(`/lecturer/outcomes/map`, data)
            .then((r) => r.data),

    getMappingBySyllabus: (syllabusId: number): Promise<CLOPLO[]> =>
        api
            .get(`/lecturer/outcomes/syllabus/${syllabusId}/map`)
            .then((r) => r.data),
};
