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
        sessionStorage.setItem('token', token)
        sessionStorage.setItem('accessToken', token)
        ;(api as any).defaults = (api as any).defaults || {}
        ;(api as any).defaults.headers = (api as any).defaults.headers || {}
        ;(api as any).defaults.headers.common = (api as any).defaults.headers.common || {}
        ;(api as any).defaults.headers.common.Authorization = `Bearer ${token}`
    }

    sessionStorage.setItem('roles', JSON.stringify(roles))
    sessionStorage.setItem('username', data.username ?? '')
    return { ...data, roles, token }
}

// export function getToken() { return sessionStorage.getItem('token') || sessionStorage.getItem('accessToken') }
export function getToken() {
    return sessionStorage.getItem('token') || sessionStorage.getItem('accessToken')
}
export function getRoles(): string[] {
    try { return JSON.parse(sessionStorage.getItem('roles') || '[]') } catch { return [] }
}
export function hasRole(role: string): boolean {
    const roles = getRoles()
    return roles.includes(role) || roles.includes(`ROLE_${role}`)
}
export function logout() {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('roles')
    sessionStorage.removeItem('username')
    window.location.href = '/login'
}