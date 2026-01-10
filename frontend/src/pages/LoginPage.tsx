import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { login } from '../services/auth'
import './login.css'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const location = useLocation() as any
    const from = location.state?.from?.pathname || '/'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await login(username, password)
            const roles = res.roles || []
            if (roles.includes('SYSTEM_ADMIN') || roles.includes('ROLE_SYSTEM_ADMIN')) navigate('/admin', { replace: true })
            else if (roles.includes('AA') || roles.includes('ROLE_AA')) navigate('/aa', { replace: true })
            else if (roles.includes('LECTURER') || roles.includes('ROLE_LECTURER')) navigate('/lecturer', { replace: true })
            else if (roles.includes('HOD') || roles.includes('ROLE_HOD')) navigate('/hod', { replace: true })
            else if (roles.includes('PRINCIPAL') || roles.includes('ROLE_PRINCIPAL')) navigate('/principal', { replace: true })
            else navigate(from || '/login', { replace: true })
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'Đăng nhập thất bại'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="uth-login-page">
            <nav className="uth-topbar">
                <div className="uth-logo">UTH <span>University of Transport</span></div>
                <div className="uth-menu">
                    <a>Hướng dẫn</a>
                    <a>Quét trùng lặp</a>
                    <a>Courses (phiên bản cũ)</a>
                </div>
                <div className="uth-spacer" />
            </nav>

            <div className="uth-hero">
                <div className="uth-hero-overlay" />
                <div className="uth-login-card">
                    <h2 className="uth-title">Đăng nhập vào Elearning</h2>
                    {error && <div className="uth-alert">{error}</div>}
                    <form className="uth-form" onSubmit={handleSubmit}>
                        <input
                            className="uth-input"
                            placeholder="Tên người dùng"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            className="uth-input"
                            type="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button className="uth-button" type="submit" disabled={loading}>
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>
                    <div className="uth-footer">Quên mật khẩu?</div>
                </div>
            </div>
        </div>
    )
}