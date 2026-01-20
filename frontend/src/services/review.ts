import { api } from "./api";

export type ReviewStatus = "ASSIGNED" | "IN_REVIEW" | "DONE" | "CANCELLED";

export type ReviewAssignment = {
    id: number;
    status: ReviewStatus;
    dueAt: string;
    startedAt?: string | null;
    completedAt?: string | null;

    // tùy BE trả về
    syllabus?: any;
    reviewer?: any;
    assignedBy?: any;
};

export type AssignReviewRequest = {
    syllabusId: number;
    reviewerUsernames: string[]; // username = CCCD
    dueAt: string; // ISO string
};

export const reviewApi = {
    // ===== HOD =====
    assign: (body: AssignReviewRequest) =>
        api
            .post<ReviewAssignment[]>("/hod/reviews/assign", body)
            .then((r) => r.data),

    listBySyllabus: (syllabusId: number) =>
        api
            .get<ReviewAssignment[]>(`/hod/reviews/syllabus/${syllabusId}`)
            .then((r) => r.data),

    cancel: (assignmentId: number) =>
        api.delete<void>(`/hod/reviews/${assignmentId}`).then((r) => r.data),

    // ===== Reviewer =====
    my: (status?: ReviewStatus) =>
        api
            .get<ReviewAssignment[]>("/reviewer/reviews/my", {
                params: status ? { status } : undefined,
            })
            .then((r) => r.data),

    start: (assignmentId: number) =>
        api
            .put<ReviewAssignment>(`/reviewer/reviews/${assignmentId}/start`)
            .then((r) => r.data),

    done: (assignmentId: number) =>
        api
            .put<ReviewAssignment>(`/reviewer/reviews/${assignmentId}/done`)
            .then((r) => r.data),
};
