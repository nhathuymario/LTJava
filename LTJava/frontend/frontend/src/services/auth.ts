import { api } from './api'

export type LoginResponse = {
    token: string
    username: string
    roles: string[] // ví dụ ["SYSTEM_ADMIN"] hoặc ["ROLE_SYSTEM_ADMIN"]
}

export async function login(username: string, password: string) {
    const { data } = await api.post<LoginResponse>('/auth/login', { username, password }, {
        headers: { Authorization: '' },
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('roles', JSON.stringify(data.roles ?? []))
    localStorage.setItem('username', data.username ?? '')
    return data
}

export function getToken() {
    return localStorage.getItem('token')
}

export function getRoles(): string[] {
    try {
        const raw = localStorage.getItem('roles')
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

export function hasRole(role: string): boolean {
    const roles = getRoles()
    // Hỗ trợ cả dạng "SYSTEM_ADMIN" và "ROLE_SYSTEM_ADMIN"
    return roles.includes(role) || roles.includes(`ROLE_${role}`)
}

export function isAuthenticated() {
    return Boolean(getToken())
}

export function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('roles')
    localStorage.removeItem('username')
    window.location.href = '/login'
}