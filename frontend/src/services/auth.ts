import { api } from './api'

export type LoginResponse = {
    token?: string
    accessToken?: string
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
    const token = (data as any).token || (data as any).accessToken || (data as any).access_token || ''
    const roles = data.roles && data.roles.length > 0 ? data.roles : (token ? extractRolesFromJwt(token) : [])

    if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('accessToken', token)
        ;(api as any).defaults = (api as any).defaults || {}
        ;(api as any).defaults.headers = (api as any).defaults.headers || {}
        ;(api as any).defaults.headers.common = (api as any).defaults.headers.common || {}
        ;(api as any).defaults.headers.common.Authorization = `Bearer ${token}`
    }

    localStorage.setItem('roles', JSON.stringify(roles))
    localStorage.setItem('username', data.username ?? '')
    return { ...data, roles, token }
}

export function getToken() { return localStorage.getItem('token') || localStorage.getItem('accessToken') }
export function getRoles(): string[] {
    try { return JSON.parse(localStorage.getItem('roles') || '[]') } catch { return [] }
}
export function hasRole(role: string): boolean {
    const roles = getRoles()
    return roles.includes(role) || roles.includes(`ROLE_${role}`)
}
export function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('roles')
    localStorage.removeItem('username')
    window.location.href = '/login'
}