import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "../../assets/css/pages/lecturer.css"

import { hasRole, getToken } from "../../services/auth"
import { getCourseById, type Course } from "../../services/course"
import { lecturerApi } from "../../services/lecturer"
import type { Syllabus } from "../../services/syllabus"
import { goHomeByRole } from "../../utils/navByRole"
import PaginationBar from "../../components/common/PaginationBar"

type SortKey = "name_asc" | "name_desc"

export default function LecturerCourseDetailPage() {
    const nav = useNavigate()
    const { courseId } = useParams()
    const id = Number(courseId)

    // ======================
    // AUTH
    // ======================
    const isLecturer = hasRole("LECTURER")

    // ======================
    // STATE
    // ======================
    const [course, setCourse] = useState<Course | null>(null)
    const [syllabi, setSyllabi] = useState<Syllabus[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // search + sort
    const [q, setQ] = useState("")
    const [sort, setSort] = useState<SortKey>("name_asc")

    // menu 3 chấm
    const [openMenuId, setOpenMenuId] = useState<number | null>(null)
    const toggleMenu = (sid: number) =>
        setOpenMenuId((prev) => (prev === sid ? null : sid))

    // ======================
    // LOAD DATA
    // ======================
    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token")

        if (!token) {
            setError("Bạn chưa đăng nhập (thiếu token).")
            setLoading(false)
            return
        }
        if (!isLecturer) {
            setError("Bạn không có quyền truy cập (LECTURER).")
            setLoading(false)
            return
        }
        if (!id) {
            setError("courseId không hợp lệ.")
            setLoading(false)
            return
        }

        ;(async () => {
            setLoading(true)
            setError(null)
            try {
                const [c, s] = await Promise.all([
                    getCourseById(id),
                    lecturerApi.getByCourse(id),
                ])
                setCourse(c)
                setSyllabi(s || [])
            } catch (err: any) {
                const resp = err?.response?.data
                const msg =
                    resp?.message ||
                    resp ||
                    err?.message ||
                    "Không tải được dữ liệu course/syllabus"
                setError(typeof msg === "string" ? msg : "Không tải được dữ liệu")
            } finally {
                setLoading(false)
            }
        })()
    }, [id, isLecturer])

    // ======================
    // ACTIONS
    // ======================
    const handleSubmit = async (sid: number) => {
        if (!window.confirm("Submit syllabus này cho HoD?")) return
        try {
            await lecturerApi.submit(sid)
            setSyllabi((prev) =>
                prev.map((s) =>
                    s.id === sid ? { ...s, status: "SUBMITTED" as any } : s
                )
            )
            setOpenMenuId(null)
        } catch (e: any) {
            alert(e?.response?.data?.message || "Submit thất bại")
        }
    }

    const handleResubmit = async (sid: number) => {
        if (!window.confirm("Gửi lại syllabus này cho HoD?")) return
        try {
            await lecturerApi.resubmit(sid)
            setSyllabi((prev) =>
                prev.map((s) =>
                    s.id === sid ? { ...s, status: "SUBMITTED" as any } : s
                )
            )
            setOpenMenuId(null)
        } catch (e: any) {
            alert(e?.response?.data?.message || "Resubmit thất bại")
        }
    }

    const handleMoveToDraft = async (sid: number) => {
        if (!window.confirm("Chuyển syllabus về DRAFT để sửa?")) return
        try {
            await lecturerApi.moveToDraft(sid)
            setSyllabi((prev) =>
                prev.map((s) =>
                    s.id === sid ? { ...s, status: "DRAFT" as any } : s
                )
            )
            setOpenMenuId(null)
        } catch (e: any) {
            alert(e?.response?.data?.message || "Move to draft thất bại")
        }
    }

    const handleUpdateVersion = async (sid: number) => {
        if (!window.confirm("Tạo version mới từ syllabus đã PUBLISHED?")) return
        try {
            const newS = await lecturerApi.createNewVersion(sid)
            setSyllabi((prev) => [newS, ...prev])
            setOpenMenuId(null)
            nav(`/lecturer/syllabus/${newS.id}/edit`, {
                state: { courseId: id },
            })
        } catch (e: any) {
            alert(e?.response?.data?.message || "Update version thất bại")
        }
    }

    const handleEdit = async (s: Syllabus) => {
        try {
            if (
                (s as any).status === "REQUESTEDIT" ||
                (s as any).status === "REJECTED"
            ) {
                await lecturerApi.moveToDraft(s.id)
            }
            setOpenMenuId(null)
            nav(`/lecturer/syllabus/${s.id}/edit`, {
                state: { courseId: id },
            })
        } catch (e: any) {
            alert(e?.response?.data?.message || "Không thể sửa syllabus")
        }
    }

    const handleDelete = async (sid: number) => {
        if (!window.confirm("Xóa syllabus này? (chỉ xóa khi DRAFT)")) return
        try {
            await lecturerApi.deleteSyllabus(sid)
            setSyllabi((prev) => prev.filter((x) => x.id !== sid))
            setOpenMenuId(null)
        } catch (e: any) {
            alert(e?.response?.data?.message || "Xóa thất bại")
        }
    }

    // ======================
    // FILTER + SORT
    // ======================
    const filtered = useMemo(() => {
        const needle = q.toLowerCase().trim()

        const list = syllabi.filter((s: any) =>
            `${s.title ?? ""} ${s.status ?? ""} ${s.academicYear ?? ""} ${
                s.semester ?? ""
            } ${s.course?.code ?? ""} ${s.course?.name ?? ""}`
                .toLowerCase()
                .includes(needle)
        )

        list.sort((a: any, b: any) => {
            const an = (a.title || "").toLowerCase()
            const bn = (b.title || "").toLowerCase()
            return sort === "name_asc"
                ? an.localeCompare(bn)
                : bn.localeCompare(an)
        })

        return list
    }, [syllabi, q, sort])

    // ======================
    // PAGINATION
    // ======================
    const PAGE_SIZE = 10
    const [page, setPage] = useState(1)

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
        [filtered.length]
    )

    useEffect(() => {
        if (page > totalPages) setPage(totalPages)
    }, [page, totalPages])

    useEffect(() => {
        setPage(1)
        setOpenMenuId(null)
    }, [q, sort])

    const paged = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE
        return filtered.slice(start, start + PAGE_SIZE)
    }, [filtered, page])

    // ======================
    // RENDER
    // ======================
    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button
                        className="lec-link"
                        onClick={() => goHomeByRole(nav)}
                    >
                        ← Quay lại
                    </button>

                    {loading && <div className="lec-empty">Đang tải...</div>}
                    {error && <div className="lec-empty">❌ {error}</div>}

                    {!loading && !error && course && (
                        <>
                            <div className="course-detail-header">
                                <div className="course-detail-title">
                                    [{course.code}] - {course.name}
                                </div>
                            </div>

                            {/* SEARCH + SORT */}
                            <div
                                className="lec-toolbar"
                                style={{ marginTop: 12 }}
                            >
                                <input
                                    className="lec-search"
                                    placeholder="Tìm syllabus..."
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                />

                                <select
                                    className="lec-select"
                                    value={sort}
                                    onChange={(e) =>
                                        setSort(e.target.value as SortKey)
                                    }
                                >
                                    <option value="name_asc">A → Z</option>
                                    <option value="name_desc">Z → A</option>
                                </select>
                            </div>

                            <div className="syllabus-folder-list">
                                {filtered.length === 0 ? (
                                    <div className="lec-empty">
                                        Không có syllabus phù hợp.
                                    </div>
                                ) : (
                                    paged.map((s: any) => (
                                        <div
                                            key={s.id}
                                            className="syllabus-folder"
                                        >
                                            <div
                                                className="syllabus-left syllabus-clickable"
                                                onClick={() =>
                                                    nav(`/syllabus/${s.id}`)
                                                }
                                            >
                                                <div className="syllabus-folder-icon">
                                                    📁
                                                </div>
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
                                                    <div className="syllabus-menu">
                                                        {s.status ===
                                                            "DRAFT" && (
                                                                <>
                                                                    <button
                                                                        className="syllabus-menu-item"
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                s
                                                                            )
                                                                        }
                                                                    >
                                                                        ✏️ Sửa
                                                                    </button>

                                                                    <button
                                                                        className="syllabus-menu-item"
                                                                        onClick={() =>
                                                                            nav(
                                                                                `/lecturer/syllabus/${s.id}/reviews`
                                                                            )
                                                                        }
                                                                    >
                                                                        💬 Xem
                                                                        review
                                                                    </button>

                                                                    <button
                                                                        className="syllabus-menu-item danger"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                s.id
                                                                            )
                                                                        }
                                                                    >
                                                                        🗑️ Xóa
                                                                    </button>

                                                                    <button
                                                                        className="syllabus-menu-item"
                                                                        onClick={() =>
                                                                            handleSubmit(
                                                                                s.id
                                                                            )
                                                                        }
                                                                    >
                                                                        📤 Submit
                                                                    </button>
                                                                </>
                                                            )}

                                                        {(s.status ===
                                                            "REQUESTEDIT" ||
                                                            s.status ===
                                                            "REJECTED") && (
                                                            <>
                                                                <button
                                                                    className="syllabus-menu-item"
                                                                    onClick={() =>
                                                                        handleMoveToDraft(
                                                                            s.id
                                                                        )
                                                                    }
                                                                >
                                                                    ✏️ Move
                                                                    to draft
                                                                </button>

                                                                <button
                                                                    className="syllabus-menu-item"
                                                                    onClick={() =>
                                                                        handleResubmit(
                                                                            s.id
                                                                        )
                                                                    }
                                                                >
                                                                    🔁 Resubmit
                                                                </button>
                                                            </>
                                                        )}

                                                        {s.status ===
                                                            "PUBLISHED" && (
                                                                <button
                                                                    className="syllabus-menu-item"
                                                                    onClick={() =>
                                                                        handleUpdateVersion(
                                                                            s.id
                                                                        )
                                                                    }
                                                                >
                                                                    🆕 Update
                                                                    version
                                                                </button>
                                                            )}

                                                        <button
                                                            className="syllabus-menu-item"
                                                            onClick={() =>
                                                                setOpenMenuId(
                                                                    null
                                                                )
                                                            }
                                                        >
                                                            Đóng
                                                        </button>
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
                                onPrev={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                onNext={() =>
                                    setPage((p) =>
                                        Math.min(totalPages, p + 1)
                                    )
                                }
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
