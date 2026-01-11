import { useEffect, useMemo, useState } from 'react'
import {
    createSyllabus,
    getMySyllabus,
    resubmitSyllabus,
    submitSyllabus,
    type CreateSyllabusRequest,
    type Syllabus,
} from '../../services/lecturer'
import { hasRole } from '../../services/auth'
import './lecturer.css'

export default function LecturerPage() {
    const [items, setItems] = useState<Syllabus[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [form, setForm] = useState<CreateSyllabusRequest>({
        title: '',
        description: '',
        content: '',
    })
    const [creating, setCreating] = useState(false)

    const isLecturer = hasRole('LECTURER')

    const canSubmit = useMemo(
        () => form.title.trim() !== '' && form.description.trim() !== '',
        [form],
    )

    const fetchMine = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getMySyllabus()
            setItems(data)
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                'Không tải được giáo trình của bạn'
            setError(typeof msg === 'string' ? msg : 'Không tải được giáo trình của bạn')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isLecturer) {
            setError('Bạn không có quyền LECTURER')
            setLoading(false)
            return
        }
        fetchMine()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLecturer])

    const onCreate = async () => {
        if (!isLecturer) {
            alert('Chỉ LECTURER')
            return
        }
        if (!canSubmit) {
            alert('Điền đủ tiêu đề và mô tả')
            return
        }
        setCreating(true)
        try {
            await createSyllabus(form)
            setForm({ title: '', description: '', content: '' })
            await fetchMine()
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data || err?.message
            alert(msg || 'Tạo giáo trình thất bại')
        } finally {
            setCreating(false)
        }
    }

    const onSubmit = async (id: number) => {
        try {
            await submitSyllabus(id)
            await fetchMine()
        } catch (err: any) {
            alert(err?.response?.data || 'Gửi duyệt thất bại')
        }
    }

    const onResubmit = async (id: number) => {
        try {
            await resubmitSyllabus(id)
            await fetchMine()
        } catch (err: any) {
            alert(err?.response?.data || 'Gửi lại thất bại')
        }
    }

    return (
        <div className="lecturer-wrapper">
            <div className="lecturer-card">
                <h1 className="lecturer-title">Lecturer</h1>
                <p className="lecturer-sub">Trang dành cho giảng viên</p>

                {error && <div className="lecturer-alert">{error}</div>}
                {loading && <p>Đang tải...</p>}

                {/* Form tạo giáo trình */}
                <section className="lecturer-section">
                    <h3>Tạo giáo trình</h3>
                    <div className="lecturer-row">
                        <input
                            className="lecturer-input"
                            placeholder="Tiêu đề"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                        />
                        <input
                            className="lecturer-input"
                            placeholder="Mô tả ngắn"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                        />
                    </div>
                    <textarea
                        className="lecturer-textarea"
                        rows={5}
                        placeholder="Nội dung chi tiết"
                        value={form.content}
                        onChange={e => setForm({ ...form, content: e.target.value })}
                    />
                    <button className="lecturer-btn" disabled={!canSubmit || creating} onClick={onCreate}>
                        {creating ? 'Đang tạo...' : 'Tạo giáo trình'}
                    </button>
                </section>

                {/* Danh sách giáo trình */}
                {!loading && !error && (
                    <section className="lecturer-section">
                        <h3>Giáo trình của tôi</h3>
                        {items.length === 0 && <p>Chưa có giáo trình.</p>}
                        <ul className="lecturer-list">
                            {items.map(item => (
                                <li key={item.id} className="lecturer-item">
                                    <div>
                                        <div className="lecturer-item-title">{item.title}</div>
                                        <div className="lecturer-item-desc">{item.description}</div>
                                        <div className="lecturer-item-meta">
                                            Trạng thái: <strong>{item.status}</strong>
                                            {item.status === 'REQUESTED_EDIT' && item.note ? (
                                                <span> — Ghi chú từ HOD: {item.note}</span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="lecturer-actions">
                                        {item.status === 'DRAFT' && (
                                            <button className="lecturer-btn secondary" onClick={() => onSubmit(item.id)}>
                                                Gửi HOD duyệt
                                            </button>
                                        )}
                                        {item.status === 'REQUESTED_EDIT' && (
                                            <button className="lecturer-btn secondary" onClick={() => onResubmit(item.id)}>
                                                Gửi lại
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </div>
    )
}