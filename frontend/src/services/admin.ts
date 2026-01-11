import { api } from './api'

export type RoleName = 'SYSTEM_ADMIN' | 'LECTURER' | 'AA' | 'STUDENT'

export type User = {
    id: number
    username: string
    fullName?: string
    cccd?: string
    dateOfBirth?: string
    enabled?: boolean
    locked?: boolean
    roles?: Array<{ name: RoleName }>
}

type CreateUserBody = {
    fullName: string
    cccd: string
    dateOfBirth: string // dd/MM/yyyy
    roleName: RoleName
}

export async function getAllUsers(): Promise<User[]> {
    const { data } = await api.get('/admin/users')
    return data
}

export async function createUser(body: CreateUserBody) {
    const { data } = await api.post('/admin/users/create', body)
    return data
}


export async function importUsersExcel(file: File) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await api.post("/admin/users/import-excel", fd, {
        headers: {
            // ✅ quan trọng: xóa Content-Type JSON nếu api.ts set sẵn
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data;
}


export async function bulkCreateUsers(items: Array<CreateUserBody>) {
    const { data } = await api.post('/admin/users/bulk-create', items)
    return data
}

export async function lockUser(id: number) {
    const { data } = await api.post(`/admin/users/${id}/lock`)
    return data
}

export async function unlockUser(id: number) {
    const { data } = await api.post(`/admin/users/${id}/unlock`)
    return data
}

export async function changeUserRole(id: number, roleName: RoleName) {
    const { data } = await api.put(`/admin/users/${id}/role`, { roleName })
    return data
}

export async function deleteUser(id: number) {
    const { data } = await api.delete(`/admin/users/${id}`)
    return data
}