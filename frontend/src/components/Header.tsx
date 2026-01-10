import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout, getRoles } from '../services/auth'

type HeaderProps = {
    username?: string
    onProfile?: () => void
    showMenu?: boolean // mặc định true, có thể tắt trên trang login
}

export default function Header({ username, onProfile, showMenu = true }: HeaderProps) {
    const [open, setOpen] = useState(false)
    const [roles, setRoles] = useState<string[]>([])
    const nav = useNavigate()
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        setRoles(getRoles())
    }, [])

    // Đóng menu khi click ngoài
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('click', handler)
        return () => document.removeEventListener('click', handler)
    }, [])

    const handleLogout = () => {
        logout()
    }

    const handleProfile = () => {
        if (onProfile) onProfile()
        else nav('/profile', { replace: false }) // bạn có thể đổi route
        setOpen(false)
    }

    const displayName = username || localStorage.getItem('username') || 'Tài khoản'
    const badge = roles.join(', ') || 'No role'

    return (
        <header style={styles.header}>
            <div style={styles.brand} onClick={() => nav('/')}>
                <span style={{ color: '#0b6b5c', fontWeight: 700 }}>UTH</span>
                <span style={{ marginLeft: 6, color: '#333' }}>Elearning</span>
            </div>
            {showMenu && (
                <div ref={ref} style={styles.userBox}>
                    <button style={styles.userBtn} onClick={() => setOpen(!open)}>
                        <div style={styles.avatar}>{displayName.charAt(0).toUpperCase()}</div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{displayName}</div>
                            <div style={{ fontSize: 12, color: '#666', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {badge}
                            </div>
                        </div>
                        <span style={styles.caret}>{open ? '▲' : '▼'}</span>
                    </button>
                    {open && (
                        <div style={styles.menu}>
                            <div style={styles.menuItem} onClick={handleProfile}>Xem thông tin</div>
                            <div style={{ ...styles.menuItem, color: '#c0392b' }} onClick={handleLogout}>Đăng xuất</div>
                        </div>
                    )}
                </div>
            )}
        </header>
    )
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        height: 56,
        padding: '0 16px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 99,
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 18,
        fontWeight: 700,
        cursor: 'pointer',
    },
    userBox: { position: 'relative' },
    userBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 10px',
        border: '1px solid #ddd',
        borderRadius: 10,
        background: '#fff',
        cursor: 'pointer',
    },
    avatar: {
        width: 28, height: 28, borderRadius: '50%',
        background: '#0b6b5c', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 14,
    },
    caret: { marginLeft: 4, fontSize: 12, color: '#555' },
    menu: {
        position: 'absolute',
        right: 0,
        marginTop: 6,
        minWidth: 160,
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: 10,
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        zIndex: 100,
    },
    menuItem: {
        padding: '10px 12px',
        cursor: 'pointer',
        fontSize: 14,
        borderBottom: '1px solid #f1f1f1',
    },
}