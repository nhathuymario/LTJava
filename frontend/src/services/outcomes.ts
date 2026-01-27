import { api } from "./api"

export type PloDto = {
    id: number
    scopeKey: string
    code: string
    description: string
    active: boolean
}

export type PloUpsertReq = {
    scopeKey: string
    code: string
    description: string
    active?: boolean
}

export type CloDto = {
    id: number
    syllabusId: number
    code: string
    description: string
    active: boolean
}

export type CloUpsertReq = {
    code: string
    description: string
    active?: boolean
}

export type MatrixCellDto = {
    cloId: number
    ploId: number
    level?: number | null
}

export type CloPloMatrixRes = {
    scopeKey: string
    plos: PloDto[]
    clos: CloDto[]
    cells: MatrixCellDto[]
}

export type CloPloMatrixSaveReq = {
    scopeKey: string
    cells: MatrixCellDto[]
}

/** ===== AA: PLO ===== */
export async function aaListPlos(scopeKey: string) {
    const { data } = await api.get<PloDto[]>("/aa/plos", { params: { scopeKey } })
    return data
}
export async function aaCreatePlo(req: PloUpsertReq) {
    const { data } = await api.post<PloDto>("/aa/plos", req)
    return data
}
export async function aaUpdatePlo(id: number, req: PloUpsertReq) {
    const { data } = await api.put<PloDto>(`/aa/plos/${id}`, req)
    return data
}
export async function aaDeletePlo(id: number) {
    await api.delete(`/aa/plos/${id}`)
}

/** ===== Lecturer: CLO ===== */
export async function lecturerListClos(syllabusId: number) {
    const { data } = await api.get<CloDto[]>(`/lecturer/syllabus/${syllabusId}/clos`)
    return data
}
export async function lecturerCreateClo(syllabusId: number, req: CloUpsertReq) {
    const { data } = await api.post<CloDto>(`/lecturer/syllabus/${syllabusId}/clos`, req)
    return data
}
export async function lecturerUpdateClo(cloId: number, req: CloUpsertReq) {
    const { data } = await api.put<CloDto>(`/lecturer/clos/${cloId}`, req)
    return data
}
export async function lecturerDeleteClo(cloId: number) {
    await api.delete(`/lecturer/clos/${cloId}`)
}

/** ===== Matrix ===== */
export async function getCloPloMatrix(syllabusId: number, scopeKey: string) {
    const { data } = await api.get<CloPloMatrixRes>(`/syllabus/${syllabusId}/clo-plo-matrix`, {
        params: { scopeKey },
    })
    return data
}
export async function saveCloPloMatrix(syllabusId: number, req: CloPloMatrixSaveReq) {
    await api.put(`/lecturer/syllabus/${syllabusId}/clo-plo-matrix`, req)
}
