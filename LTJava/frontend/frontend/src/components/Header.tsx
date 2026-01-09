import { NavLink, useNavigate } from 'react-router-dom'
// @ts-ignore
import styles from './Header.module.css'
import { isAuthenticated, hasRole, logout } from '../services/auth'

export default function Header() {
    const navigate = useNavigate()
    const authed = isAuthenticated()
    const isAdmin = hasRole('SYSTEM_ADMIN')
    const isLecturer = hasRole('LECTURER')
    const isAA = hasRole('AA')
    const username = localStorage.getItem('username') || 'Khách'

    const onLogout = () => {
        logout()
    }

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <div className={styles.brand} onClick={() => navigate(authed ? '/' : '/login')}>
                    UTH Elearning
                </div>

                <nav className={styles.nav}>
                    {authed && (
                        <>
                            <NavLink
                                to="/"
                                className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
                                end
                            >
                                Dashboard
                            </NavLink>

                            {isLecturer && (
                                <NavLink
                                    to="/syllabus"
                                    className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
                                >
                                    Syllabus
                                </NavLink>
                            )}

                            {isAA && (
                                <NavLink
                                    to="/aa"
                                    className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
                                >
                                    AA
                                </NavLink>
                            )}

                            {isAdmin && (
                                <NavLink
                                    to="/admin"
                                    className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
                                >
                                    Quản trị
                                </NavLink>
                            )}
                        </>
                    )}
                </nav>

                <div className={styles.right}>
                    {authed ? (
                        <>
                            <span className={styles.user}>Xin chào, {username}</span>
                            <button className={styles.logout} onClick={onLogout}>
                                Đăng xuất
                            </button>
                        </>
                    ) : (
                        <NavLink to="/login" className={styles.loginBtn}>
                            Đăng nhập
                        </NavLink>
                    )}
                </div>
            </div>
        </header>
    )
}