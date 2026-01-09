import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, hasRole, isAuthenticated } from '../services/auth'
// @ts-ignore
import styles from './LoginPage.module.css'

export default function LoginPage() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Nếu đã đăng nhập thì chuyển hướng theo role
    useEffect(() => {
        if (isAuthenticated()) {
            if (hasRole('SYSTEM_ADMIN')) navigate('/admin', { replace: true })
            else if (hasRole('LECTURER')) navigate('/syllabus', { replace: true })
            else if (hasRole('AA')) navigate('/aa', { replace: true })
            else navigate('/', { replace: true })
        }
    }, [navigate])

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await login(username.trim(), password)

            if (hasRole('SYSTEM_ADMIN')) navigate('/admin', { replace: true })
            else if (hasRole('LECTURER')) navigate('/syllabus', { replace: true })
            else if (hasRole('AA')) navigate('/aa', { replace: true })
            else navigate('/', { replace: true })
        } catch (err: any) {
            const msg = err?.response?.data || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin.'
            setError(typeof msg === 'string' ? msg : 'Đăng nhập thất bại')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.overlay} />
            <div className={styles.panel}>
                <h2 className={styles.title}>Đăng nhập vào Elearning</h2>
                <form onSubmit={onSubmit} className={styles.form}>
                    <label className={styles.label}>
                        <span>Mã số sinh viên / Tên đăng nhập</span>
                        <input
                            className={styles.input}
                            placeholder="MSSV"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                        />
                    </label>

                    <label className={styles.label}>
                        <span>Mật khẩu</span>
                        <div className={styles.passwordRow}>
                            <input
                                className={styles.input}
                                type={showPw ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className={styles.eyeBtn}
                                onClick={() => setShowPw((s) => !s)}
                                aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                                {showPw ? 'Ẩn' : 'Hiện'}
                            </button>
                        </div>
                    </label>

                    {error && <div className={styles.error}>{error}</div>}

                    <button
                        type="submit"
                        disabled={loading || !username || !password}
                        className={styles.submit}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>

                    <div className={styles.footerRow}>
                        <a href="#" className={styles.link}>Quên mật khẩu?</a>
                    </div>
                </form>
            </div>
        </div>
    )
}