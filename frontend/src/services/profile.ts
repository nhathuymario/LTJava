import {api} from "./api"; // dùng axios instance hiện tại của bạn

export type MeResponse = {
    id: number;
    username: string;
    cccd?: string | null;
    fullName?: string | null;
    dateOfBirth?: string | null;
    active: boolean;
    roles: string[];
    profile: {
        email?: string | null;
        phone?: string | null;
        address?: string | null;
        avatarUrl?: string | null;
        bio?: string | null;
    };
};

export type UpdateMyProfileRequest = {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    bio?: string;
};

export type ChangeMyPasswordRequest = {
    currentPassword: string;
    newPassword: string;
};

export const profileApi = {
    me: () => api.get<MeResponse>("/users/me").then((r) => r.data),

    updateProfile: (payload: UpdateMyProfileRequest) =>
        api.put<MeResponse>("/users/me/profile", payload).then((r) => r.data),

    changePassword: (payload: ChangeMyPasswordRequest) =>
        api.put("/users/me/password", payload).then((r) => r.data),

    uploadAvatar: (file: File) => {
        const form = new FormData();
        form.append("file", file);

        return api
            .post<string>("/users/me/avatar", form, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((r) => r.data); // trả về avatarUrl string
    },
};
