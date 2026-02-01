import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import "../../assets/css/pages/lecturer.css"

import { hasRole, getToken } from "../../services/auth"
import type { Syllabus } from "../../services/syllabus"
import { studentApi, type Course } from "../../services/student"
import { goHomeByRole } from "../../utils/navByRole"
import PaginationBar from "../../components/common/PaginationBar"

export default function StudentCourseSyllabusPage() {
    const nav = useNavigate()
    const { courseId } = useParams<{ courseId: string }>()

    const cid = useMemo(() => {
        const n = Number(courseId)
        return Number.isFinite(n) ? n : null
    }, [courseId])

    const location = useLocation() as any
    const courseFromState = location?.state?.course as Course | undefined

    const [items, setItems] = useState<Syllabus[]>([])
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState<string | null>(null)

    // ======================
    // FILTER STATE
    // ======================
    const [keyword, setKeyword] = useState("")
    const [academicYear, setAcademicYear] = useState("")
    const [semester, setSemester] = useState("")

    const isStudent = hasRole("STUDENT") || hasRole("ROLE_STUDENT")

    // ======================
    // LOAD DATA
    // ======================
    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token")

        if (!token) {
            setErr("Bạn chưa đăng nhập (thiếu token).")
            setLoading(false)
            return
        }
        if (!isStudent) {
            setErr("Bạn không có quyền truy cập trang này (STUDENT).")
            setLoading(false)
            return
        }
        if (!cid) {
            setErr("Course ID không hợp lệ.")
            setLoading(false)
            return
        }

        ;(async () => {
            setLoading(true)
            setErr(null)
            try {
                const data = await studentApi.publishedByCourse(cid)
                setItems(data || [])
            } catch (e: any) {
                if (e?.response?.status === 403) {
                    setErr("Bạn chưa đăng ký môn học này.")
                } else {
                    setErr(e?.response?.data?.message || e?.message || "Không tải được syllabus")
                }
            } finally {
                setLoading(false)
            }
        })()
    }, [cid, isStudent])

    // ======================
    // FILTER + SORT
    // ======================
    const view = useMemo(() => {
        const k = keyword.trim().toLowerCase()

        return items
            .filter((s) => {
                const okKeyword =
                    !k ||
                    `${s.title || ""} ${s.description || ""} ${s.keywords || ""}`
                        .toLowerCase()
                        .includes(k)

                const okYear =
                    !academicYear ||
                    (s.academicYear || "").toLowerCase().includes(academicYear.toLowerCase())

                const okSem =
                    !semester ||
                    (s.semester || "").toLowerCase().includes(semester.toLowerCase())

                return okKeyword && okYear && okSem
            })
            .sort((a, b) => (b.version || 0) - (a.version || 0))
    }, [items, keyword, academicYear, semester])

    // ======================
    // PAGINATION
    // ======================
    const PAGE_SIZE = 10
    const [page, setPage] = useState(1)

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(view.length / PAGE_SIZE)),
        [view.length]
    )

    // nếu filter làm giảm số trang
    useEffect(() => {
        if (page > totalPages) setPage(totalPages)
    }, [page, totalPages])

    // đổi filter → reset page
    useEffect(() => {
        setPage(1)
    }, [keyword, academicYear, semester])

    const paged = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE
        return view.slice(start, start + PAGE_SIZE)
    }, [view, page])

    // ======================
    // RENDER
    // ======================
    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button className="lec-link" onClick={() => goHomeByRole(nav)}>
                        ← Quay lại
                    </button>

                    <div className="course-detail-title" style={{ marginTop: 10 }}>
                        [{courseFromState?.code || "COURSE"}] -{" "}
                        {courseFromState?.name || `Course #${cid}`}
                    </div>

                    {/* FILTER BAR */}
                    <div className="lec-toolbar" style={{ marginTop: 12 }}>
                        <input
                            className="lec-search"
                            placeholder="Keyword"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <input
                            className="lec-search"
                            placeholder="Academic year"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                        />
                        <input
                            className="lec-search"
                            placeholder="Semester"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                        />
                    </div>

                    {loading && <div className="lec-empty">Đang tải...</div>}
                    {err && <div className="lec-empty">❌ {err}</div>}

                    {!loading && !err && (
                        <>
                            <div className="syllabus-folder-list">
                                {view.length === 0 ? (
                                    <div className="lec-empty">
                                        Chưa có giáo trình public cho course này.
                                    </div>
                                ) : (
                                    paged.map((s) => (
                                        <div
                                            key={s.id}
                                            className="syllabus-folder"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => nav(`/syllabus/${s.id}`)}
                                        >
                                            <div className="syllabus-left">
                                                <div className="syllabus-folder-icon">📘</div>
                                                <div className="syllabus-folder-name">
                                                    {s.title}
                                                    <span
                                                        className={`syllabus-status status-${String(
                                                            s.status || ""
                                                        ).toLowerCase()}`}
                                                    >
                                                        {s.status}
                                                    </span>
                                                    <span
                                                        style={{
                                                            marginLeft: 8,
                                                            fontSize: 12,
                                                            color: "#6b6f76",
                                                        }}
                                                    >
                                                        v{s.version}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ color: "#6b6f76", fontSize: 13 }}>
                                                {s.academicYear ? `AY: ${s.academicYear}` : ""}
                                                {s.semester ? ` · Sem: ${s.semester}` : ""}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* ✅ DÙNG PaginationBar */}
                            <PaginationBar
                                page={page}
                                totalPages={totalPages}
                                totalItems={view.length}
                                pageSize={PAGE_SIZE}
                                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
