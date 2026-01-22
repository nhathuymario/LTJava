import { api } from "./api";

export type NotificationDto = {
    id: number;
    message: string;
    read: boolean;
    createdAt: string;
};

export const notificationApi = {
    listMine: async (): Promise<NotificationDto[]> => {
        const res = await api.get("/notifications/me");
        return res.data;
    },

    unreadCount: async (): Promise<number> => {
        const res = await api.get("/notifications/me/unread");
        return Number(res.data) || 0;
    },

    markRead: async (id: number): Promise<void> => {
        await api.patch(`/notifications/me/${id}/read`);
    },

    readAll: async (): Promise<void> => {
        await api.patch("/notifications/me/read-all");
    },
};
