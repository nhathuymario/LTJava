import { api } from './api'

export type Role = { name: string }
export type User = {
    id: number
    username: string
    roles: Role[]
    locked?: boolean
    enabled?: boolean
    fullName?: string
    cccd?: string
    dateOfBirth?: string
    [key: string]: any
}

export async function getAllUsers() {
    const res = await api.get<User[]>('/admin/users')
    return res.data
}

// Tạo đơn: theo Postman
export async function createUser(payload: {
    fullName: string
    cccd: string
    dateOfBirth: string // dd/MM/yyyy
    roleName: string
}) {
    const res = await api.post<User>('/admin/users/create', payload)
    return res.data
}

// Tạo nhiều: mảng object cùng schema
export async function bulkCreateUsers(payload: Array<{
    fullName: string
    cccd: string
    dateOfBirth: string // dd/MM/yyyy
    roleName: string
}>) {
    const res = await api.post<User[]>('/admin/users/bulk-create', payload)
    return res.data
}

export async function lockUser(id: number) {
    const res = await api.post<User>(`/admin/users/${id}/lock`)
    return res.data
}

export async function unlockUser(id: number) {
    const res = await api.post<User>(`/admin/users/${id}/unlock`)
    return res.data
}

export async function changeUserRole(id: number, roleName: string) {
    const res = await api.put<User>(`/admin/users/${id}/role`, { roleName })
    return res.data
}

export async function deleteUser(id: number) {
    const res = await api.delete<string>(`/admin/users/${id}`)
    return res.data
}