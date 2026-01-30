import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "../../../assets/css/pages/lecturer.css"
import { hasRole, getToken } from "../../../services/auth"
import type { CourseOutcomes } from "./types"
import { createEmptyCourseOutcomes } from "./defaults"
import CloPloMatrixView from "../../../components/outcomes/CloPloMatrixView"

// ✅ view chung (content + meta)
import { viewSyllabusContent, viewSyllabusMeta } from "../../../services/outcomes"

// ===== types (meta) =====
type SyllabusMeta = {
    id: number
    title?: string
    academicYear?: string
    semester?: string
    aiSummary?: string
    keywords?: string
    status?: string
    version?: number
    course?: { id: number; code?: string; name?: string }
}

/** ✅ parse JSON string an toàn (BE đôi khi trả string) */
function safeJsonParse<T>(v: any, fallback: T): T {
    if (v === null || v === undefined) return fallback
    if (typeof v !== "string") return v as T
    try {
        return JSON.parse(v) as T
    } catch {
        return fallback
    }
}

/** ✅ ép array an toàn để tránh .map crash */
function asArray<T>(v: any, fallback: T[] = []): T[] {
    if (Array.isArray(v)) return v as T[]
    if (typeof v === "string") return safeJsonParse<T[]>(v, fallback)
    return fallback
}

/** ✅ pick fallback value */
function pickFirst(...vals: any[]) {
    for (const v of vals) {
        if (v !== null && v !== undefined && String(v).trim() !== "") return v
    }
    return null
}

function parseKeywords(raw: any): string[] {
    if (!raw) return []
    if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean)
    return String(raw)
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
}

/** ✅ normalize content để UI không bao giờ crash */
function normalizeCourseOutcomes(raw: any): CourseOutcomes {
    const empty = createEmptyCourseOutcomes()

    const gi = safeJsonParse<Record<string, any>>(raw?.generalInfo, {})
    const mergedGI = {
        ...empty.generalInfo,
        ...(gi ?? {}),
        ...(raw?.generalInfo && typeof raw.generalInfo === "object" ? raw.generalInfo : {}),
    }

    const courseObjectives = asArray<string>(raw?.courseObjectives, [])
    const courseLearningOutcomes = asArray<{ code: string; description: string }>(raw?.courseLearningOutcomes, [])
    const assessmentMethods = asArray<{ component: string; method: string; clos: string; criteria: string }>(
        raw?.assessmentMethods,
        []
    )
    const teachingPlan = asArray<any>(raw?.teachingPlan, [])
    const cloMappings = asArray<any>(raw?.cloMappings, [])

    return {
        ...empty,
        ...raw,
        generalInfo: mergedGI as any,

        description: raw?.description ?? empty.description,
        studentDuties: raw?.studentDuties ?? empty.studentDuties,

        courseObjectives,

        courseLearningOutcomes: courseLearningOutcomes.map((x: any) => ({
            code: x?.code ?? "",
            description: x?.description ?? "",
        })) as any,

        assessmentMethods: assessmentMethods.map((m: any) => ({
            component: m?.component ?? "",
            method: m?.method ?? "",
            clos: m?.clos ?? "",
            criteria: m?.criteria ?? "",
        })) as any,

        teachingPlan: teachingPlan.map((p: any) => ({
            week: p?.week ?? "",
            chapter: p?.chapter ?? "",
            content: p?.content ?? "",
            clos: p?.clos ?? "",
            teaching: p?.teaching ?? "",
            assessment: p?.assessment ?? "",
        })) as any,

        cloMappings: cloMappings.map((x: any) => ({
            clo: x?.clo ?? "",
            plo: x?.plo ?? "",
            level: x?.level ?? null,
        })) as any,
    }
}

function normalizeMeta(raw: any): SyllabusMeta | null {
    if (!raw) return null

    // BE có thể trả courseId/courseCode... hoặc course object
    const courseObj = (raw as any)?.course
    const course =
        courseObj && typeof courseObj === "object"
            ? {
                id: Number(courseObj?.id),
                code: courseObj?.code,
                name: courseObj?.name,
            }
            : (raw as any)?.courseId
                ? {
                    id: Number((raw as any)?.courseId),
                    code: (raw as any)?.courseCode,
                    name: (raw as any)?.courseName,
                }
                : undefined

    const idNum = Number((raw as any)?.id)
    return {
        id: Number.isFinite(idNum) ? idNum : 0,
        title: (raw as any)?.title,
        academicYear: (raw as any)?.academicYear,
        semester: (raw as any)?.semester,
        aiSummary: (raw as any)?.aiSummary,
        keywords: (raw as any)?.keywords,
        status: (raw as any)?.status,
        version: (raw as any)?.version,
        course,
    }
}

export default function LecturerSyllabusDetailPage() {
    const nav = useNavigate()
    const { syllabusId } = useParams<{ syllabusId: string }>()

    const sid = useMemo(() => {
        const n = Number(syllabusId)
        return Number.isFinite(n) ? n : null
    }, [syllabusId])

    const token = getToken()

    const isLecturer = hasRole("LECTURER") || hasRole("ROLE_LECTURER")
    const isHod = hasRole("HOD") || hasRole("ROLE_HOD")
    const isAa = hasRole("AA") || hasRole("ROLE_AA")
    const isPrincipal = hasRole("PRINCIPAL") || hasRole("ROLE_PRINCIPAL")
    const isAdmin = hasRole("SYSTEM_ADMIN") || hasRole("ROLE_SYSTEM_ADMIN")
    const isStudent = hasRole("STUDENT") || hasRole("ROLE_STUDENT")

    const canView = isLecturer || isHod || isAa || isPrincipal || isAdmin || isStudent

    const [meta, setMeta] = useState<SyllabusMeta | null>(null)
    const [content, setContent] = useState<CourseOutcomes>(() => createEmptyCourseOutcomes())
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState<string | null>(null)

    useEffect(() => {
        if (!token) {
            nav("/login", { replace: true })
            return
        }
        if (!canView) {
            setErr("Bạn không có quyền xem syllabus này.")
            setLoading(false)
            return
        }
        if (sid === null) {
            setErr("Syllabus ID không hợp lệ.")
            setLoading(false)
            return
        }

        let cancelled = false

        ;(async () => {
            setLoading(true)
            setErr(null)
            setMeta(null)

            try {
                // ✅ 1) content view chung
                const rawContent = await viewSyllabusContent(sid)
                if (cancelled) return
                setContent(normalizeCourseOutcomes(rawContent))

                // ✅ 2) meta view chung (role-based) — ai canView cũng thử load
                try {
                    const rawMeta = await viewSyllabusMeta(sid)
                    if (cancelled) return
                    setMeta(normalizeMeta(rawMeta))
                } catch (e) {
                    // nếu role không đủ quyền (vd student mà syllabus chưa PUBLISHED) thì meta sẽ fail -> dùng fallback từ content
                    console.warn("Load meta via /api/syllabus/{id}/meta failed:", e)
                    if (!cancelled) setMeta(null)
                }
            } catch (e: any) {
                if (cancelled) return
                setErr(e?.response?.data?.message || e?.message || "Không tải được nội dung syllabus")
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()

        return () => {
            cancelled = true
        }
    }, [token, canView, sid, nav])

    // ===== Guards UI (không trắng) =====
    if (!token) {
        return (
            <div className="lec-page">
                <div className="lec-container">
                    <div className="lec-card">Redirecting to login...</div>
                </div>
            </div>
        )
    }

    if (token && !canView) {
        return (
            <div className="lec-page">
                <div className="lec-container">
                    <div className="lec-card">
                        <button className="lec-link" onClick={() => nav("/", { replace: true })}>
                            ← Go home
                        </button>
                        <h2 className="lec-section-title" style={{ marginTop: 10 }}>
                            403 - Forbidden
                        </h2>
                        <div>Bạn không có quyền xem syllabus này.</div>
                    </div>
                </div>
            </div>
        )
    }

    if (sid === null) {
        return (
            <div className="lec-page">
                <div className="lec-container">
                    <div className="lec-card">
                        <button className="lec-link" onClick={() => nav(-1)}>
                            ← Quay lại
                        </button>
                        <div style={{ marginTop: 10 }}>Syllabus ID không hợp lệ.</div>
                    </div>
                </div>
            </div>
        )
    }

    // ===== FALLBACK: ưu tiên meta, không có thì lấy từ content/generalInfo =====
    const academicYear =
        pickFirst(
            meta?.academicYear,
            (content as any)?.academicYear,
            (content as any)?.generalInfo?.academicYear,
            (content as any)?.academic_year,
            (content as any)?.generalInfo?.academic_year
        ) ?? "—"

    const semester =
        pickFirst(
            meta?.semester,
            (content as any)?.semester,
            (content as any)?.generalInfo?.semester,
            (content as any)?.sem,
            (content as any)?.generalInfo?.sem
        ) ?? "—"

    const aiSummary =
        pickFirst(
            meta?.aiSummary,
            (content as any)?.aiSummary,
            (content as any)?.ai_summary,
            (content as any)?.generalInfo?.aiSummary,
            (content as any)?.generalInfo?.ai_summary
        ) ?? "—"

    const keywordsRaw =
        pickFirst(
            meta?.keywords,
            (content as any)?.keywords,
            (content as any)?.key_words,
            (content as any)?.generalInfo?.keywords,
            (content as any)?.generalInfo?.key_words
        ) ?? ""

    const keywords = parseKeywords(keywordsRaw)

    const courseIdFromMeta = meta?.course?.id ?? null
    const courseIdFromContent = (() => {
        const gi: any = (content as any)?.generalInfo ?? {}
        const v = gi.courseId ?? gi.course_id ?? null
        const n = Number(v)
        return Number.isFinite(n) ? n : null
    })()
    const courseId = courseIdFromMeta ?? courseIdFromContent

    const scopeKey = (content as any)?.generalInfo?.scopeKey

    const courseObjectives = Array.isArray(content.courseObjectives) ? content.courseObjectives : []
    const clos = Array.isArray(content.courseLearningOutcomes) ? content.courseLearningOutcomes : []
    const assessmentMethods = Array.isArray(content.assessmentMethods) ? content.assessmentMethods : []
    const teachingPlan = Array.isArray(content.teachingPlan) ? content.teachingPlan : []

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="manage-toolbar">
                    <button className="lec-btn" onClick={() => (courseId ? nav(`/lecturer/courses/${courseId}`) : nav(-1))}>
                        ← Back
                    </button>

                    <div style={{ flex: 1 }} />

                    {isLecturer && (
                        <button className="lec-btn" disabled={loading} onClick={() => nav(`/lecturer/syllabus/${sid}/outcomes`)}>
                            Outcomes (Edit)
                        </button>
                    )}
                </div>

                {loading && <div className="lec-card">Đang tải...</div>}
                {err && <div className="lec-card">❌ {err}</div>}

                {!loading && !err && (
                    <>
                        {/* HEADER */}
                        <div className="lec-card" style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>TRƯỜNG ĐH GIAO THÔNG VẬN TẢI TP.HCM</div>
                            <h2 className="lec-section-title" style={{ marginTop: 0 }}>
                                ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
                            </h2>

                            <div style={{ marginTop: 10, color: "#6b6f76" }}>
                                {content.generalInfo?.nameVi ? (
                                    <>
                                        Course: <b>{content.generalInfo.nameVi}</b> ·{" "}
                                    </>
                                ) : null}
                                {content.generalInfo?.codeId ? (
                                    <>
                                        Code: <b>{content.generalInfo.codeId}</b> ·{" "}
                                    </>
                                ) : null}
                                {content.generalInfo?.credits ? (
                                    <>
                                        Credits: <b>{content.generalInfo.credits}</b>
                                    </>
                                ) : null}
                            </div>

                            <div style={{ marginTop: 6, color: "#6b6f76", fontSize: 13 }}>
                                AY: <b>{academicYear}</b> · Sem: <b>{semester}</b>
                            </div>
                        </div>

                        {/* AI Summary + Keywords */}
                        <div className="lec-card" style={{ marginTop: 12 }}>
                            <h3 className="lec-section-title">AI Summary & Keywords</h3>

                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontWeight: 700, marginBottom: 6 }}>Tóm tắt (AI)</div>
                                <div style={{ whiteSpace: "pre-wrap" }}>{aiSummary}</div>
                            </div>

                            <div>
                                <div style={{ fontWeight: 700, marginBottom: 6 }}>Keywords</div>
                                {keywords.length ? (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {keywords.map((k) => (
                                            <span
                                                key={k}
                                                style={{
                                                    display: "inline-block",
                                                    padding: "4px 10px",
                                                    borderRadius: 999,
                                                    border: "1px solid #e5e7eb",
                                                    background: "#f9fafb",
                                                    fontSize: 13,
                                                }}
                                            >
                        {k}
                      </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ color: "#6b6f76" }}>—</div>
                                )}
                            </div>
                        </div>

                        {/* 1. Tổng quát */}
                        <div className="lec-card" style={{ marginTop: 12 }}>
                            <h3 className="lec-section-title">1. Tổng quát về học phần</h3>

                            <table className="lec-table">
                                <tbody>
                                <tr>
                                    <td style={{ width: 180, fontWeight: 600 }}>Tên học phần</td>
                                    <td>
                                        <div>
                                            <b>Tiếng Việt:</b> {content.generalInfo?.nameVi || "—"}
                                        </div>
                                        <div>
                                            <b>Tiếng Anh:</b> {content.generalInfo?.nameEn || "—"}
                                        </div>
                                    </td>
                                    <td style={{ width: 140, fontWeight: 600 }}>Mã HP</td>
                                    <td style={{ width: 140 }}>{content.generalInfo?.codeId || "—"}</td>
                                </tr>

                                <tr>
                                    <td style={{ fontWeight: 600 }}>Số tín chỉ</td>
                                    <td colSpan={3}>{content.generalInfo?.credits || "—"}</td>
                                </tr>

                                <tr>
                                    <td style={{ fontWeight: 600 }}>Phân bố thời gian</td>
                                    <td colSpan={3}>
                                        LT/BT: {content.generalInfo?.theory || "—"} · TH/TN: {content.generalInfo?.practice || "—"} ·
                                        DA/TL: {content.generalInfo?.project || "—"} · Tổng: {content.generalInfo?.total || "—"} · Tự học:{" "}
                                        {content.generalInfo?.selfStudy || "—"}
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ fontWeight: 600 }}>HP tiên quyết</td>
                                    <td>{content.generalInfo?.prerequisiteId || "—"}</td>
                                    <td style={{ fontWeight: 600 }}>HP song hành</td>
                                    <td>{content.generalInfo?.corequisiteId || "—"}</td>
                                </tr>

                                <tr>
                                    <td style={{ fontWeight: 600 }}>Loại học phần</td>
                                    <td>{content.generalInfo?.courseType || "—"}</td>
                                    <td style={{ fontWeight: 600 }}>Thuộc thành phần</td>
                                    <td>{content.generalInfo?.component || "—"}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 2. Mô tả */}
                        <div className="lec-card" style={{ marginTop: 12 }}>
                            <h3 className="lec-section-title">2. Mô tả tóm tắt học phần</h3>
                            <div style={{ whiteSpace: "pre-wrap" }}>{content.description || "—"}</div>
                        </div>

                        {/* 3. Mục tiêu */}
                        <div className="lec-card" style={{ marginTop: 12 }}>
                            <h3 className="lec-section-title">3. Mục tiêu học phần (COs)</h3>
                            {courseObjectives.length ? (
                                <ul style={{ marginTop: 6 }}>
                                    {courseObjectives.map((x, i) => (
                                        <li key={i}>
                                            <b>CO{i + 1}:</b> {x || "—"}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="lec-empty">—</div>
                            )}
                        </div>

                        {/* 4. CLOs */}
                        <div className="lec-card" style={{ marginTop: 12 }}>
                            <h3 className="lec-section-title">4. Chuẩn đầu ra học phần (CLOs)</h3>
                            {clos.length ? (
                                <table className="lec-table">
                                    <thead>
                                    <tr>
                                        <th style={{ width: 120 }}>CLO</th>
                                        <th>Mô tả</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {clos.map((clo: any, idx: number) => (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: 600 }}>{clo?.code || `CLO${idx + 1}`}</td>
                                            <td>{clo?.description || "—"}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="lec-empty">—</div>
                            )}
                        </div>

                        {/* 4.1 CLO-PLO MATRIX */}
                        {scopeKey ? (
                            <CloPloMatrixView syllabusId={sid} scopeKey={scopeKey} />
                        ) : (
                            <div className="lec-card" style={{ marginTop: 12 }}>
                                <div className="lec-empty">Chưa có scopeKey nên chưa xem được CLO–PLO Matrix.</div>
                            </div>
                        )}

                        {/* 5. Nhiệm vụ SV */}
                        <div className="lec-card" style={{ marginTop: 12 }}>
                            <h3 className="lec-section-title">5. Nhiệm vụ của sinh viên</h3>
                            <div style={{ whiteSpace: "pre-wrap" }}>{content.studentDuties || "—"}</div>
                        </div>

                        {/* 6. Đánh giá */}
                        <div className="lec-card" style={{ marginTop: 12 }}>
                            <h3 className="lec-section-title">6. Phương pháp kiểm tra, đánh giá</h3>

                            {assessmentMethods.length ? (
                                <table className="lec-table">
                                    <thead>
                                    <tr>
                                        <th>Thành phần</th>
                                        <th>Phương pháp/Hình thức</th>
                                        <th>CLOs</th>
                                        <th>Tiêu chí</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {assessmentMethods.map((m: any, idx: number) => (
                                        <tr key={idx}>
                                            <td>{m?.component || "—"}</td>
                                            <td>{m?.method || "—"}</td>
                                            <td>{m?.clos || "—"}</td>
                                            <td>{m?.criteria || "—"}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="lec-empty">—</div>
                            )}
                        </div>

                        {/* 7. Kế hoạch giảng dạy */}
                        <div className="lec-card" style={{ marginTop: 12 }}>
                            <h3 className="lec-section-title">7. Kế hoạch giảng dạy và học tập</h3>

                            {teachingPlan.length ? (
                                <table className="lec-table">
                                    <thead>
                                    <tr>
                                        <th style={{ width: 140 }}>Tuần/Chương</th>
                                        <th>Nội dung</th>
                                        <th style={{ width: 120 }}>CLOs</th>
                                        <th>Hoạt động dạy & học</th>
                                        <th style={{ width: 140 }}>Bài đánh giá</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {teachingPlan.map((p: any, idx: number) => (
                                        <tr key={idx}>
                                            <td>{p?.week || "—"}</td>
                                            <td>{p?.content || "—"}</td>
                                            <td>{p?.clos || "—"}</td>
                                            <td style={{ whiteSpace: "pre-wrap" }}>{p?.teaching || "—"}</td>
                                            <td>{p?.assessment || "—"}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="lec-empty">—</div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
