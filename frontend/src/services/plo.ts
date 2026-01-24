import { api } from "./api";
import type { PLO } from "./outcome";

export interface CreatePLORequest {
    code: string;
    description: string;
    program?: string | null;
}

export const ploApi = {
    // ===== AA: quản lý PLO =====
    createForAA: (payload: CreatePLORequest) =>
        api.post<PLO>("/aa/plo", payload).then((r) => r.data),

    listForAA: () =>
        api.get<PLO[]>("/aa/plo").then((r) => r.data),

    // ===== Lecturer: chỉ đọc để map CLO =====
    listForLecturer: () =>
        api.get<PLO[]>("/lecturer/plo").then((r) => r.data),

    updateForAA: (id: number, payload: CreatePLORequest) =>
        api.put<PLO>(`/aa/plo/${id}`, payload).then(r => r.data),

    deleteForAA: (id: number) =>
        api.delete(`/aa/plo/${id}`)

};

