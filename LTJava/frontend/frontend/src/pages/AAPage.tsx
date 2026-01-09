import { useEffect, useState } from 'react'
import { api } from '../services/api'

type AAItem = {
    id: number
    title: string
    updatedAt?: string
    [key: string]: any
}

export default function AAPage() {
    const [items, setItems] = useState<AAItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                // Đổi endpoint theo backend của bạn nếu cần
                const res = await api.get<AAItem[]>('/aa/overview')
                setItems(res.data)
            } catch (err: any) {
                const msg = err?.response?.data || 'Không tải được dữ liệu AA'
                setError(typeof msg === 'string' ? msg : 'Lỗi tải dữ liệu')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <div style={{ padding: 24 }}>
            <h1>Trang AA</h1>
            {loading && <p>Đang tải...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && (
                <ul>
                    {items.map((x) => (
                        <li key={x.id}>
                            <b>{x.title}</b> — {x.updatedAt || '-'}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}