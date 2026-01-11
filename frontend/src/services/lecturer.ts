import { api } from './api'

export type SyllabusStatus =
    | 'DRAFT'
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'REQUESTED_EDIT'
    | 'RESUBMITTED'

export type Syllabus = {
    id: number
    title: string
    description?: string
    content?: string
    status: SyllabusStatus
    note?: string // ghi chú từ HOD khi yêu cầu chỉnh sửa
}

export type CreateSyllabusRequest = {
    title: string
    description: string
    content: string
}

export async function createSyllabus(body: CreateSyllabusRequest): Promise<Syllabus> {
    const { data } = await api.post('/api/syllabus/create', body)
    return data
}

export async function submitSyllabus(id: number): Promise<Syllabus> {
    const { data } = await api.put(`/api/syllabus/${id}/submit`)
    return data
}

export async function resubmitSyllabus(id: number): Promise<Syllabus> {
    const { data } = await api.put(`/api/syllabus/${id}/resubmit`)
    return data
}

export async function getMySyllabus(): Promise<Syllabus[]> {
    const { data } = await api.get('/api/syllabus/my')
    return data
}

export type SyllabusWithCourse = Syllabus & { courseId?: number };

export async function getSyllabusByCourse(courseId: number): Promise<Syllabus[]> {
    const { data } = await api.get(`/api/syllabus/course/${courseId}`);
    return data;
}
