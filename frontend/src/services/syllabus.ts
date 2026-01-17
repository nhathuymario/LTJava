
export type SyllabusStatus =
    | 'DRAFT'
    | 'SUBMITTED'
    | 'HOD_APPROVED'
    | 'AA_APPROVED'
    | 'PRINCIPAL_APPROVED'
    | 'PUBLISHED'
    | 'REQUESTEDIT'
    | 'REJECTED'

export interface Course {
    id: number
    code?: string
    name?: string
}

export interface User {
    id: number
    username?: string
    fullName?: string
}

export interface Syllabus {
    id: number
    title: string
    description?: string
    academicYear?: string
    semester?: string
    status: SyllabusStatus
    version: number
    editNote?: string | null

    aiSummary?: string | null
    keywords?: string | null

    course?: Course
    createdBy?: User

    createdAt?: string;
    updatedAt?: string;
}

export interface CreateSyllabusRequest {
    courseId: number
    title: string
    description?: string
    academicYear?: string
    semester?: string
}

export interface NoteRequest {
    note: string
}

export interface SyllabusHistory {
    id: number
    syllabusId: number
    title: string
    description?: string
    academicYear?: string
    semester?: string
    status: SyllabusStatus
    version: number
    updatedAt?: string
    // ✅ backend hay trả object user, không phải string
    updatedBy?: User | null;
}

export interface Notification {
    id: number
    content: string
    createdAt?: string
}
