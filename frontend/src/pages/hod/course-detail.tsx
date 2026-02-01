import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import "../../assets/css/pages/hod.css"

import { hasRole, getToken } from "../../services/auth"
import { hodApi } from "../../services/hod"
import type { Syllabus } from "../../services/syllabus"

import PaginationBar from "../../components/common/PaginationBar"
import { goHomeByRole } from "../../utils/navByRole"

type SortKey = "name_asc" | "name_desc"

export default function HodCourseDetailPage() {
    const nav = useNavigate()
    const { courseId } = useParams()
    const id = Number(courseId)

    const loc = useLocation() as any
    const initialCourse = loc.state?.course
    const initialSyllabi: Syllabus[] = loc.state?.syllabi || []

    const [syllabi, setSyllabi] = useState<Syllabus[]>(initialSyllabi)
    const [loading, setLoading] = useState(initialSyllabi.length === 0)
    const [error, setError] = useState<string | null>(null)

    // menu 3 chấm
    const [openMenuId, setOpenMenuId] = useState<number | null>(null)
    const toggleMenu = (sid: number) => setOpenMenuId((p) => (p === sid ? null : sid))

    // ✅ chỉ filter theo tên
    const [q, setQ] = useState("")
    const [sort, setSort] = useState<SortKey>("name_asc")

    // pagination
    const PAGE_SIZE = 10
    const [page, setPage] = useState(1)

    const isHod = hasRole("HOD")

    // =====================================================
    // LOAD (refresh trang -> fetch SUBMITTED và filter theo courseId)
    // =====================================================
    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token")

        if (!token) {
            setError("Bạn chưa đăng nhập (thiếu token).")
            setLoading(false)
            return
        }
        if (!isHod) {
            setError("Bạn không có quyền truy cập (HOD).")
            setLoading(false)
            return
        }
        if (!id) {
            setError("courseId không hợp lệ.")
            setLoading(false)
            return
        }

        // có data từ state thì khỏi fetch
        if (initialSyllabi.length > 0) return

            ;(async () => {
            setLoading(true)
            setError(null)
            try {
                const list = await hodApi.listByStatus("SUBMITTED")
                const filteredByCourse = (list || []).filter((s: any) => Number(s?.course?.id) === id)
                setSyllabi(filteredByCourse)
            } catch (err: any) {
                const resp = err?.response?.data
                const msg = resp?.message || resp || err?.message || "Không tải được syllabus cho course"
                setError(typeof msg === "string" ? msg : "Không tải được dữ liệu")
            } finally {
                setLoading(false)
            }
        })()
    }, [id, isHod, initialSyllabi.length])

    // =====================================================
    // ACTIONS
    // =====================================================
    const approve = async (sid: number) => {
        if (!window.confirm("HoD duyệt syllabus này?")) return
        try {
            await hodApi.approve(sid)
            setSyllabi((prev: any) => prev.map((s: any) => (s.id === sid ? { ...s, status: "HOD_APPROVED" } : s)))
            setOpenMenuId(null)
        } catch (err: any) {
            alert(err?.response?.data?.message || "Approve thất bại")
        }
    }

    const requestEdit = async (sid: number) => {
        const note = window.prompt("Nhập nội dung yêu cầu chỉnh sửa:")
        if (!note || !note.trim()) return

        try {
            await hodApi.requestEdit(sid, note.trim())
            setSyllabi((prev: any) =>
                prev.map((s: any) => (s.id === sid ? { ...s, status: "REQUESTEDIT", editNote: note.trim() } : s))
            )
            setOpenMenuId(null)
        } catch (err: any) {
            alert(err?.response?.data?.message || "Request edit thất bại")
        }
    }

    const reject = async (sid: number) => {
        const note = window.prompt("Lý do từ chối (có thể bỏ trống):") || ""
        if (!window.confirm("Từ chối syllabus này?")) return

        try {
            await hodApi.reject(sid, note.trim())
            setSyllabi((prev: any) =>
                prev.map((s: any) => (s.id === sid ? { ...s, status: "REJECTED", editNote: note.trim() } : s))
            )
            setOpenMenuId(null)
        } catch (err: any) {
            alert(err?.response?.data?.message || "Reject thất bại")
        }
    }

    const courseTitle = initialCourse
        ? `[${initialCourse.code || "NO_CODE"}] - ${initialCourse.name || `Course #${id}`}`
        : `Course #${id}`

    // =====================================================
    // ✅ FILTER + SORT: chỉ theo TITLE
    // =====================================================
    const filtered = useMemo(() => {
        const needle = q.toLowerCase().trim()

        const list = syllabi.filter((s: any) => ((s.title ?? "") as string).toLowerCase().includes(needle))

        list.sort((a: any, b: any) => {
            const an = ((a.title ?? "") as string).toLowerCase()
            const bn = ((b.title ?? "") as string).toLowerCase()
            return sort === "name_asc" ? an.localeCompare(bn) : bn.localeCompare(an)
        })

        return list
    }, [syllabi, q, sort])

    // =====================================================
    // PAGINATION
    // =====================================================
    const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)), [filtered.length])

    // filter làm giảm số trang -> kéo page về hợp lệ
    useEffect(() => {
        if (page > totalPages) setPage(totalPages)
    }, [page, totalPages])

    // đổi search/sort -> reset trang 1 + đóng menu
    useEffect(() => {
        setPage(1)
        setOpenMenuId(null)
    }, [q, sort])

    const paged = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE
        return filtered.slice(start, start + PAGE_SIZE)
    }, [filtered, page])

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button className="lec-link" onClick={() => goHomeByRole(nav)}>
                        ← Quay lại
                    </button>

                    <div className="course-detail-header">
                        <div className="course-detail-title">{courseTitle}</div>
                        <div className="course-detail-desc">HoD duyệt các syllabus đang SUBMITTED cho course này</div>
                    </div>

                    {loading && <div className="lec-empty">Đang tải...</div>}
                    {error && <div className="lec-empty">❌ {error}</div>}

                    {!loading && !error && (
                        <>
                            {/* ✅ FILTER BAR: chỉ tìm theo tên */}
                            <div className="lec-toolbar" style={{ marginTop: 12 }}>
                                <input
                                    className="lec-search"
                                    placeholder="Tìm theo tên syllabus..."
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                />

                                <select className="lec-select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                                    <option value="name_asc">Sort A → Z</option>
                                    <option value="name_desc">Sort Z → A</option>
                                </select>
                            </div>

                            <div className="syllabus-folder-list">
                                {filtered.length === 0 ? (
                                    <div className="lec-empty">Không có syllabus phù hợp.</div>
                                ) : (
                                    paged.map((s: any) => (
                                        <div key={s.id} className="syllabus-folder">
                                            <div className="syllabus-left" style={{ cursor: "pointer" }} onClick={() => nav(`/syllabus/${s.id}`)}>
                                                <div className="syllabus-folder-icon">📁</div>
                                                <div className="syllabus-folder-name">
                                                    {s.title}
                                                    <span className={`syllabus-status status-${String(s.status || "").toLowerCase()}`}>{s.status}</span>
                                                </div>
                                            </div>

                                            <div className="syllabus-actions">
                                                <button
                                                    className="syllabus-more"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleMenu(s.id)
                                                    }}
                                                >
                                                    ⋮
                                                </button>

                                                {openMenuId === s.id && (
                                                    <div className="syllabus-menu" onClick={(e) => e.stopPropagation()}>
                                                        {s.status === "SUBMITTED" ? (
                                                            <>
                                                                <button className="syllabus-menu-item" onClick={() => approve(s.id)}>
                                                                    ✅ Approve
                                                                </button>
                                                                <button className="syllabus-menu-item" onClick={() => requestEdit(s.id)}>
                                                                    ✍️ Request edit
                                                                </button>
                                                                <button className="syllabus-menu-item" onClick={() => reject(s.id)}>
                                                                    ❌ Reject
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button className="syllabus-menu-item" onClick={() => setOpenMenuId(null)}>
                                                                Đóng
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <PaginationBar
                                page={page}
                                totalPages={totalPages}
                                totalItems={filtered.length}
                                pageSize={PAGE_SIZE}
                                onPrev={() => {
                                    setPage((p) => Math.max(1, p - 1))
                                    setOpenMenuId(null)
                                }}
                                onNext={() => {
                                    setPage((p) => Math.min(totalPages, p + 1))
                                    setOpenMenuId(null)
                                }}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
