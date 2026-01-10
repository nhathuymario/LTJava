import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getToken, getRoles } from './services/auth'

type Props = { allowedRoles: string[] }

export default function RequireAuth({ allowedRoles }: Props) {
    const token = getToken()
    const roles = getRoles()
    const location = useLocation()

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }
    const ok = roles.some(r => allowedRoles.includes(r) || allowedRoles.includes(`ROLE_${r}`))
    if (!ok) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }
    return <Outlet />
}