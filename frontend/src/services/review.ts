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

export type HodReviewListParams = {
    courseId?: number;
    syllabusId?: number;
    status?: ReviewStatus;
    reviewer?: string;
    fromDue?: string; // ISO string
    toDue?: string;   // ISO string
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

    listAll: (params: HodReviewListParams = {}) =>
        api
            .get<ReviewAssignment[]>("/hod/reviews", {
                params,
            })
            .then((r) => r.data),

    reviewerCancel: (assignmentId: number) =>
        api
            .put<void>(`/reviewer/reviews/${assignmentId}/cancel`)
            .then((r) => r.data),
};
