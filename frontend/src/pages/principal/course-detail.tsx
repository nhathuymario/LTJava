import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import "../../assets/css/pages/hod.css"

import { hasRole, getToken } from "../../services/auth"
import { principalApi } from "../../services/principal"
import type { Syllabus } from "../../services/syllabus"
import PaginationBar from "../../components/common/PaginationBar"
import { goHomeByRole } from "../../utils/navByRole"

export default function PrincipalCourseDetailPage() {
    const nav = useNavigate()
    const { courseId } = useParams()
    const id = Number(courseId)

    const loc = useLocation() as any
    // const viewStatus = (loc.state?.viewStatus as string) || "AA_APPROVED"
    const initialCourse = loc.state?.course
    const initialSyllabi: Syllabus[] = loc.state?.syllabi || []

    const [syllabi, setSyllabi] = useState<Syllabus[]>(initialSyllabi)
    const [loading, setLoading] = useState(initialSyllabi.length === 0)
    const [error, setError] = useState<string | null>(null)

    const [openMenuId, setOpenMenuId] = useState<number | null>(null)
    const toggleMenu = (sid: number) => setOpenMenuId((p) => (p === sid ? null : sid))

    const isPrincipal = hasRole("PRINCIPAL")

    // =========================
    // 🔎 SEARCH (chỉ theo title)
    // =========================
    const [keyword, setKeyword] = useState("")

    // =========================
    // FETCH ALL (AA_APPROVED + PRINCIPAL_APPROVED + PUBLISHED)
    // =========================
    const fetchAll = async (opts?: { silent?: boolean }) => {
        const silent = !!opts?.silent
        if (!silent) setLoading(true)
        setError(null)

        try {
            const [aa, pa, pub] = await Promise.all([
                principalApi.listByStatus("AA_APPROVED"),
                principalApi.listByStatus("PRINCIPAL_APPROVED"),
                principalApi.listByStatus("PUBLISHED"),
            ])

            const merged = [...(aa || []), ...(pa || []), ...(pub || [])]
                .filter((s: any) => Number(s?.course?.id) === id)
                .sort((a: any, b: any) => Number(b.id) - Number(a.id))

            setSyllabi(merged)
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Không tải được syllabus cho course"
            setError(typeof msg === "string" ? msg : "Không tải được dữ liệu")
        } finally {
            if (!silent) setLoading(false)
        }
    }

    // =========================
    // INIT
    // =========================
    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token")

        if (!token) {
            setError("Bạn chưa đăng nhập (thiếu token).")
            setLoading(false)
            return
        }
        if (!isPrincipal) {
            setError("Bạn không có quyền truy cập (PRINCIPAL).")
            setLoading(false)
            return
        }
        if (!id) {
            setError("courseId không hợp lệ.")
            setLoading(false)
            return
        }

        fetchAll()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isPrincipal])

    // =========================
    // ACTIONS (optimistic)
    // =========================
    const approve = async (sid: number) => {
        if (!window.confirm("Principal duyệt syllabus này?")) return
        setOpenMenuId(null)

        setSyllabi((prev) =>
            prev.map((s: any) => (s.id === sid ? { ...s, status: "PRINCIPAL_APPROVED" } : s))
        )

        try {
            await principalApi.approve(sid)
            fetchAll({ silent: true })
        } catch (err: any) {
            alert(err?.response?.data?.message || "Approve thất bại")
            fetchAll({ silent: true })
        }
    }

    const publish = async (sid: number) => {
        if (!window.confirm("Public syllabus này?")) return
        setOpenMenuId(null)

        setSyllabi((prev) =>
            prev.map((s: any) => (s.id === sid ? { ...s, status: "PUBLISHED" } : s))
        )

        try {
            await principalApi.publish(sid)
            fetchAll({ silent: true })
        } catch (err: any) {
            alert(err?.response?.data?.message || "Publish thất bại")
            fetchAll({ silent: true })
        }
    }

    const reject = async (sid: number) => {
        const note = window.prompt("Lý do từ chối (có thể bỏ trống):") || ""
        if (!window.confirm("Từ chối syllabus này?")) return
        setOpenMenuId(null)

        setSyllabi((prev) =>
            prev.map((s: any) =>
                s.id === sid ? { ...s, status: "REJECTED", editNote: note.trim() } : s
            )
        )

        try {
            await principalApi.reject(sid, note.trim())
            fetchAll({ silent: true })
        } catch (err: any) {
            alert(err?.response?.data?.message || "Reject thất bại")
            fetchAll({ silent: true })
        }
    }

    const courseTitle = initialCourse
        ? `[${initialCourse.code || "NO_CODE"}] - ${initialCourse.name || `Course #${id}`}`
        : `Course #${id}`

    // =========================
    // 🔎 FILTER (title only)
    // =========================
    const view = useMemo(() => {
        const k = keyword.toLowerCase().trim()
        if (!k) return syllabi
        return syllabi.filter((s: any) =>
            String(s?.title || "").toLowerCase().includes(k)
        )
    }, [syllabi, keyword])

    // =========================
    // 📄 PAGINATION
    // =========================
    const PAGE_SIZE = 10
    const [page, setPage] = useState(1)

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(view.length / PAGE_SIZE)),
        [view.length]
    )

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
                        <div className="course-detail-desc">
                            Principal xử lý <b>AA_APPROVED</b> (Approve/Reject),
                            <b> PRINCIPAL_APPROVED</b> (Publish/Reject),
                            <b> PUBLISHED</b> là đã public.
                        </div>
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
                                    <div className="lec-empty">
                                        Course này không có syllabus cần xử lý.
                                    </div>
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
                                                    <span
                                                        className={`syllabus-status status-${String(
                                                            s.status || ""
                                                        ).toLowerCase()}`}
                                                    >
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
                                                    <div
                                                        className="syllabus-menu"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {s.status === "AA_APPROVED" ? (
                                                            <>
                                                                <button
                                                                    className="syllabus-menu-item"
                                                                    onClick={() => approve(s.id)}
                                                                >
                                                                    ✅ Approve
                                                                </button>
                                                                <button
                                                                    className="syllabus-menu-item"
                                                                    onClick={() => reject(s.id)}
                                                                >
                                                                    ❌ Reject
                                                                </button>
                                                            </>
                                                        ) : s.status === "PRINCIPAL_APPROVED" ? (
                                                            <>
                                                                <button
                                                                    className="syllabus-menu-item"
                                                                    onClick={() => publish(s.id)}
                                                                >
                                                                    🌍 Publish
                                                                </button>
                                                                <button
                                                                    className="syllabus-menu-item"
                                                                    onClick={() => reject(s.id)}
                                                                >
                                                                    ❌ Reject
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                className="syllabus-menu-item"
                                                                onClick={() => setOpenMenuId(null)}
                                                            >
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
