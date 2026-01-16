import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout, getRoles } from '../services/auth'
import '../assets/css/components/Header.css'

import { HEADER_ACTIONS } from '../config/headerActions'
import { filterActionsByRoles } from '../utils/filterByRoles'

type HeaderProps = {
    username?: string
    onProfile?: () => void
    showMenu?: boolean
}

export default function Header({ username, onProfile, showMenu = true }: HeaderProps) {
    const [open, setOpen] = useState(false)
    const [roles, setRoles] = useState<string[]>([])
    const nav = useNavigate()
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        setRoles(getRoles())
    }, [])

    // đóng menu khi click ngoài
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('click', handler)
        return () => document.removeEventListener('click', handler)
    }, [])

    const handleLogout = () => logout()

    const handleProfile = () => {
        if (onProfile) onProfile()
        else nav('/profile')
        setOpen(false)
    }

    const handleGo = (to: string) => {
        nav(to)
        setOpen(false)
    }

    const displayName = username || localStorage.getItem('username') || 'Tài khoản'
    const badge = roles.join(', ') || 'No role'

    const visibleActions = useMemo(
        () => filterActionsByRoles(HEADER_ACTIONS, roles),
        [roles]
    )

    return (
        <header className="header">
            <div className="brand" onClick={() => nav('/')}>
                <span className="brand-main">UTH</span>
                <span className="brand-sub">Elearning</span>
            </div>

            {showMenu && (
                <div ref={ref} className="user-box">
                    <button className="user-btn" onClick={() => setOpen(!open)}>
                        <div className="avatar">{displayName.charAt(0).toUpperCase()}</div>

                        <div className="user-text">
                            <div className="username">{displayName}</div>
                            <div className="role">{badge}</div>
                        </div>

                        <span className="caret">{open ? '▲' : '▼'}</span>
                    </button>

                    {open && (
                        <div className="menu">
                            {/* ✅ Actions theo role */}
                            {visibleActions.map(a => (
                                <div key={a.key} className="menu-item" onClick={() => handleGo(a.to)}>
                                    {a.icon ? `${a.icon} ` : ''}{a.label}
                                </div>
                            ))}

                            {/* separator nếu có action */}
                            {visibleActions.length > 0 && <div className="menu-sep" />}

                            {/* Common */}
                            <div className="menu-item" onClick={handleProfile}>Xem thông tin</div>
                            <div className="menu-item logout" onClick={handleLogout}>Đăng xuất</div>
                        </div>
                    )}
                </div>
            )}
        </header>
    )
}
