import type { HeaderAction } from '../config/headerActions'

export function filterActionsByRoles(actions: HeaderAction[], roles: string[]) {
    const set = new Set(roles)
    return actions.filter(a => !a.roles || a.roles.some(r => set.has(r)))
}
