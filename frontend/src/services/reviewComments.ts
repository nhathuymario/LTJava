import { api } from "./api";

export type CommentResponse = {
    id: number;
    content: string;
    commenterId: number;
    commenterName?: string;
    createdAt?: string;
    updatedAt?: string;
};

export const reviewCommentApi = {
    list: (assignmentId: number) =>
        api
            .get<CommentResponse[]>(`/reviews/${assignmentId}/comments`)
            .then((r) => r.data),

    add: (assignmentId: number, content: string) =>
        api
            .post<CommentResponse>(`/reviews/${assignmentId}/comments`, { content })
            .then((r) => r.data),

    update: (commentId: number, content: string) =>
        api
            .put<CommentResponse>(`/comments/${commentId}`, { content })
            .then((r) => r.data),

    remove: (commentId: number) =>
        api.delete<void>(`/comments/${commentId}`).then((r) => r.data),
};
