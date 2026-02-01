import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import "../../assets/css/pages/aa/aa.css"

import { hasRole, getToken } from "../../services/auth"
import { aaApi } from "../../services/aa"
import type { Syllabus, SyllabusStatus } from "../../services/syllabus"
import PaginationBar from "../../components/common/PaginationBar"
import { goHomeByRole } from "../../utils/navByRole"

export default function AACourseDetailPage() {
    const nav = useNavigate()
    const { courseId } = useParams()
    const id = Number(courseId)

    const loc = useLocation() as any
    const initialCourse = loc.state?.course
    const initialSyllabi: Syllabus[] = loc.state?.syllabi || []
    const initialStatus: SyllabusStatus = loc.state?.status || "HOD_APPROVED"

    const [syllabi, setSyllabi] = useState<Syllabus[]>(initialSyllabi)
    const [loading, setLoading] = useState(initialSyllabi.length === 0)
    const [error, setError] = useState<string | null>(null)

    // menu 3 chấm
    const [openMenuId, setOpenMenuId] = useState<number | null>(null)
    const toggleMenu = (sid: number) => setOpenMenuId((p) => (p === sid ? null : sid))

    const isAA = hasRole("AA")

    // =========================
    // 🔎 SEARCH STATE (chỉ theo title)
    // =========================
    const [keyword, setKeyword] = useState("")

    // =========================
    // LOAD
    // =========================
    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token")

        if (!token) {
            setError("Bạn chưa đăng nhập (thiếu token).")
            setLoading(false)
            return
        }
        if (!isAA) {
            setError("Bạn không có quyền truy cập (AA).")
            setLoading(false)
            return
        }
        if (!id) {
            setError("courseId không hợp lệ.")
            setLoading(false)
            return
        }

        // nếu có data từ state thì khỏi fetch
        if (initialSyllabi.length > 0) return

            ;(async () => {
            setLoading(true)
            setError(null)
            try {
                const list = await aaApi.listByStatus(initialStatus)
                const filteredByCourse = (list || []).filter((s: any) => Number(s?.course?.id) === id)
                setSyllabi(filteredByCourse)
            } catch (err: any) {
                const resp = err?.response?.data
                const msg = resp?.message || resp || err?.message || "Không tải được syllabus"
                setError(typeof msg === "string" ? msg : "Không tải được dữ liệu")
            } finally {
                setLoading(false)
            }
        })()
    }, [id, isAA, initialSyllabi.length, initialStatus])

    // =========================
    // ACTIONS
    // =========================
    const approve = async (sid: number) => {
        if (!window.confirm("AA duyệt syllabus này?")) return
        try {
            await aaApi.approve(sid)
            setSyllabi((prev) => prev.map((s: any) => (s.id === sid ? { ...s, status: "AA_APPROVED" } : s)))
            setOpenMenuId(null)
        } catch (err: any) {
            alert(err?.response?.data?.message || "Approve thất bại")
        }
    }

    const reject = async (sid: number) => {
        const note = window.prompt("Lý do reject (có thể bỏ trống):") || ""
        if (!window.confirm("Reject syllabus này?")) return
        try {
            await aaApi.reject(sid, note.trim())
            setSyllabi((prev) =>
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

    // =========================
    // 🔎 FILTER (chỉ theo title)
    // =========================
    const view = useMemo(() => {
        const k = keyword.toLowerCase().trim()
        if (!k) return syllabi
        return syllabi.filter((s: any) => String(s?.title || "").toLowerCase().includes(k))
    }, [syllabi, keyword])

    // =========================
    // 📄 PAGINATION
    // =========================
    const PAGE_SIZE = 10
    const [page, setPage] = useState(1)

    const totalPages = useMemo(() => Math.max(1, Math.ceil(view.length / PAGE_SIZE)), [view.length])

    useEffect(() => {
        if (page > totalPages) setPage(totalPages)
    }, [page, totalPages])

    useEffect(() => {
        setPage(1)
        setOpenMenuId(null)
    }, [keyword])

    const paged = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE
        return view.slice(start, start + PAGE_SIZE)
    }, [view, page])

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button className="lec-link" onClick={() => goHomeByRole(nav)}>
                        ← Quay lại
                    </button>

                    <div className="course-detail-header">
                        <div className="course-detail-title">{courseTitle}</div>
                        <div className="course-detail-desc">AA xử lý syllabus theo trạng thái: {initialStatus}</div>
                    </div>

                    {/* 🔎 SEARCH BAR */}
                    <div className="lec-toolbar" style={{ marginTop: 12 }}>
                        <input
                            className="lec-search"
                            placeholder="Tìm theo tên syllabus"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>

                    {loading && <div className="lec-empty">Đang tải...</div>}
                    {error && <div className="lec-empty">❌ {error}</div>}

                    {!loading && !error && (
                        <>
                            <div className="syllabus-folder-list">
                                {view.length === 0 ? (
                                    <div className="lec-empty">Không có syllabus phù hợp.</div>
                                ) : (
                                    paged.map((s: any) => (
                                        <div key={s.id} className="syllabus-folder">
                                            <div
                                                className="syllabus-left"
                                                onClick={() => nav(`/syllabus/${s.id}`)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div className="syllabus-folder-icon">📁</div>
                                                <div className="syllabus-folder-name">
                                                    {s.title}
                                                    <span className={`syllabus-status status-${String(s.status || "").toLowerCase()}`}>
                            {s.status}
                          </span>
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
                                                    <div className="syllabus-menu">
                                                        {s.status === "HOD_APPROVED" && (
                                                            <>
                                                                <button className="syllabus-menu-item" onClick={() => approve(s.id)}>
                                                                    ✅ Approve
                                                                </button>
                                                                <button className="syllabus-menu-item" onClick={() => reject(s.id)}>
                                                                    ❌ Reject
                                                                </button>
                                                            </>
                                                        )}

                                                        <button className="syllabus-menu-item" onClick={() => setOpenMenuId(null)}>
                                                            Đóng
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* ✅ PaginationBar dùng component của bạn */}
                            <PaginationBar
                                page={page}
                                totalPages={totalPages}
                                totalItems={view.length}
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
