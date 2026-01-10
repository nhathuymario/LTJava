import { api } from './api'

export type LoginResponse = {
    token: string
    username: string
    roles?: string[]
}

function extractRolesFromJwt(token: string): string[] {
    try {
        const payload = JSON.parse(atob(token.split('.')[1] || ''))
        const rs = payload?.roles ?? payload?.authorities ?? payload?.scope ?? []
        return Array.isArray(rs) ? rs : [String(rs)]
    } catch {
        return []
    }
}

export async function login(username: string, password: string) {
    const { data } = await api.post<LoginResponse>('/auth/login', { username, password }, { headers: { Authorization: '' } })
    const roles = data.roles && data.roles.length > 0 ? data.roles : extractRolesFromJwt(data.token)
    localStorage.setItem('token', data.token)
    localStorage.setItem('roles', JSON.stringify(roles))
    localStorage.setItem('username', data.username ?? '')
    return { ...data, roles }
}

export function getToken() { return localStorage.getItem('token') }
export function getRoles(): string[] {
    try { return JSON.parse(localStorage.getItem('roles') || '[]') } catch { return [] }
}
export function hasRole(role: string): boolean {
    const roles = getRoles()
    return roles.includes(role) || roles.includes(`ROLE_${role}`)
}
export function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('roles')
    localStorage.removeItem('username')
    window.location.href = '/login'
}