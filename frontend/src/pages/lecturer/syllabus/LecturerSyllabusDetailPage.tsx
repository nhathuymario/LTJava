import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../assets/css/pages/lecturer.css";
import { hasRole, getToken } from "../../../services/auth";
import type { CourseOutcomes } from "./types";
import { createEmptyCourseOutcomes } from "./defaults";
import CloPloMatrixView from "../../../components/outcomes/CloPloMatrixView";
import { api } from "../../../services/api";

/** VIEW CHUNG: GET /api/syllabus/{id}/content */
async function viewSyllabusContent(syllabusId: number) {
    const { data } = await api.get(`/syllabus/${syllabusId}/content`);
    return data;
}

/** META: GET /api/syllabus/{id} (academicYear/semester/aiSummary/keywords...) */
type SyllabusMeta = {
    id: number;
    title?: string;
    academicYear?: string;
    semester?: string;
    aiSummary?: string;
    keywords?: string;
    status?: string;
    version?: number;
    // nếu backend trả course:
    course?: { id: number; code?: string; name?: string };
};

async function getSyllabusMeta(syllabusId: number) {
    // ⚠️ nếu backend bạn dùng endpoint khác thì đổi dòng này:
    // const { data } = await api.get(`/student/syllabus/${syllabusId}`);
    const { data } = await api.get(`/syllabus/${syllabusId}`);
    return data as SyllabusMeta;
}

function parseKeywords(raw?: string): string[] {
    if (!raw) return [];
    return raw
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
}

export default function LecturerSyllabusDetailPage() {
    const nav = useNavigate();
    const { syllabusId } = useParams<{ syllabusId: string }>();

    const sid = useMemo(() => {
        const n = Number(syllabusId);
        return Number.isFinite(n) ? n : null;
    }, [syllabusId]);

    const [meta, setMeta] = useState<SyllabusMeta | null>(null);

    const [content, setContent] = useState<CourseOutcomes>(() =>
        createEmptyCourseOutcomes()
    );
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const token = getToken();

    const isLecturer = hasRole("LECTURER") || hasRole("ROLE_LECTURER");
    const canView =
        isLecturer ||
        hasRole("HOD") ||
        hasRole("ROLE_HOD") ||
        hasRole("AA") ||
        hasRole("ROLE_AA") ||
        hasRole("PRINCIPAL") ||
        hasRole("ROLE_PRINCIPAL") ||
        hasRole("SYSTEM_ADMIN") ||
        hasRole("ROLE_SYSTEM_ADMIN") ||
        hasRole("STUDENT") ||
        hasRole("ROLE_STUDENT");

    useEffect(() => {
        if (!token) {
            nav("/login", { replace: true });
            return;
        }
        if (!canView) {
            setErr("Bạn không có quyền xem syllabus này.");
            setLoading(false);
            return;
        }
        if (sid === null) {
            setErr("Syllabus ID không hợp lệ.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        (async () => {
            setLoading(true);
            setErr(null);
            setMeta(null); // ✅ reset meta tránh dùng dữ liệu cũ

            try {
                const [m, c] = await Promise.all([
                    getSyllabusMeta(sid).catch(() => null),
                    viewSyllabusContent(sid),
                ]);
                if (cancelled) return;

                setMeta(m);

                const empty = createEmptyCourseOutcomes();
                setContent({
                    ...empty,
                    ...c,
                    generalInfo: {
                        ...empty.generalInfo,
                        ...(c?.generalInfo ?? {}),
                    },
                });
            } catch (e: any) {
                if (cancelled) return;
                setErr(
                    e?.response?.data?.message ||
                    e?.message ||
                    "Không tải được nội dung syllabus"
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [token, canView, sid, nav]);


    if (!token) {
        return (
            <div className="lec-page">
                <div className="lec-container">
                    <div className="lec-card">Redirecting to login...</div>
                </div>
            </div>
        );
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
        );
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
        );
    }

    const keywords = parseKeywords(meta?.keywords);
    const courseId = meta?.course?.id ?? null;

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="manage-toolbar">
                    <button
                        className="lec-btn"
                        onClick={() => (courseId ? nav(`/lecturer/courses/${courseId}`) : nav(-1))}
                    >
                        ← Back
                    </button>



                    <div style={{ flex: 1 }} />

                    {isLecturer && (
                        <button
                            className="lec-btn"
                            disabled={loading}
                            onClick={() => nav(`/lecturer/syllabus/${sid}/outcomes`)}
                        >
                            Outcomes (Edit)
                        </button>
                    )}
                </div>

                {loading && <div className="lec-card">Đang tải...</div>}
                {err && <div className="lec-card">❌ {err}</div>}

                {!loading && !err && (
                    <>
                        {/* HEADER giống Word */}
                        <div className="lec-card" style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>
                                TRƯỜNG ĐH GIAO THÔNG VẬN TẢI TP.HCM
                            </div>
                            <h2 className="lec-section-title" style={{ marginTop: 0 }}>
                                ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
                            </h2>

                            <div style={{ marginTop: 10, color: "#6b6f76" }}>
                                {content.generalInfo.nameVi ? (
                                    <>
                                        Course: <b>{content.generalInfo.nameVi}</b> ·{" "}
                                    </>
                                ) : null}
                                {content.generalInfo.codeId ? (
                                    <>
                                        Code: <b>{content.generalInfo.codeId}</b> ·{" "}
                                    </>
                                ) : null}
                                {content.generalInfo.credits ? (
                                    <>
                                        Credits: <b>{content.generalInfo.credits}</b>
                                    </>
                                ) : null}
                            </div>

                            {/* ✅ CHỈ THÊM: AY + Semester (không ảnh hưởng layout cũ) */}
                            <div style={{ marginTop: 6, color: "#6b6f76", fontSize: 13 }}>
                                AY: <b>{meta?.academicYear || "—"}</b> · Sem:{" "}
                                <b>{meta?.semester || "—"}</b>
                            </div>
                        </div>

                        {/* ✅ CHỈ THÊM: AI Summary + Keywords */}
                        <div className="lec-card" style={{ marginTop: 12 }}>
                            <h3 className="lec-section-title">AI Summary & Keywords</h3>

                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontWeight: 700, marginBottom: 6 }}>Tóm tắt (AI)</div>
                                <div style={{ whiteSpace: "pre-wrap" }}>
                                    {meta?.aiSummary || "—"}
                                </div>
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
                                            <b>Tiếng Việt:</b> {content.generalInfo.nameVi || "—"}
                                        </div>
                                        <div>
                                            <b>Tiếng Anh:</b> {content.generalInfo.nameEn || "—"}
                                        </div>
                                    </td>
                                    <td style={{ width: 140, fontWeight: 600 }}>Mã HP</td>
                                    <td style={{ width: 140 }}>{content.generalInfo.codeId || "—"}</td>
                                </tr>

                                <tr>
                                    <td style={{ fontWeight: 600 }}>Số tín chỉ</td>
                                    <td colSpan={3}>{content.generalInfo.credits || "—"}</td>
                                </tr>

                                <tr>
                                    <td style={{ fontWeight: 600 }}>Phân bố thời gian</td>
                                    <td colSpan={3}>
                                        LT/BT: {content.generalInfo.theory || "—"} · TH/TN:{" "}
                                        {content.generalInfo.practice || "—"} · DA/TL:{" "}
                                        {content.generalInfo.project || "—"} · Tổng:{" "}
                                        {content.generalInfo.total || "—"} · Tự học:{" "}
                                        {content.generalInfo.selfStudy || "—"}
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ fontWeight: 600 }}>HP tiên quyết</td>
                                    <td>{content.generalInfo.prerequisiteId || "—"}</td>
                                    <td style={{ fontWeight: 600 }}>HP song hành</td>
                                    <td>{content.generalInfo.corequisiteId || "—"}</td>
                                </tr>

                                <tr>
                                    <td style={{ fontWeight: 600 }}>Loại học phần</td>
                                    <td>{content.generalInfo.courseType || "—"}</td>
                                    <td style={{ fontWeight: 600 }}>Thuộc thành phần</td>
                                    <td>{content.generalInfo.component || "—"}</td>
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
                            {content.courseObjectives?.length ? (
                                <ul style={{ marginTop: 6 }}>
                                    {content.courseObjectives.map((x, i) => (
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
                            {content.courseLearningOutcomes?.length ? (
                                <table className="lec-table">
                                    <thead>
                                    <tr>
                                        <th style={{ width: 120 }}>CLO</th>
                                        <th>Mô tả</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {content.courseLearningOutcomes.map((clo, idx) => (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: 600 }}>
                                                {clo.code || `CLO${idx + 1}`}
                                            </td>
                                            <td>{clo.description || "—"}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="lec-empty">—</div>
                            )}
                        </div>

                        {/* 4.1 CLO-PLO VIEW (guard scopeKey) */}
                        {content.generalInfo.scopeKey ? (
                            <CloPloMatrixView syllabusId={sid} scopeKey={content.generalInfo.scopeKey} />
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

                            {content.assessmentMethods?.length ? (
                                <table className="lec-table">
                                    <thead>
                                    <tr>
                                        <th>Thành phần</th>
                                        <th>Phương pháp/Hình thức</th>
                                        <th>CLOs</th>
                                        <th>Tiêu chí</th>
                                        <th style={{ width: 120, textAlign: "center" }}>Trọng số</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {content.assessmentMethods.map((m, idx) => (
                                        <tr key={idx}>
                                            <td>{m.component || "—"}</td>
                                            <td>{m.method || "—"}</td>
                                            <td>{m.clos || "—"}</td>
                                            <td>{m.criteria || "—"}</td>
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

                            {content.teachingPlan?.length ? (
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
                                    {content.teachingPlan.map((p, idx) => (
                                        <tr key={idx}>
                                            <td>{p.week || "—"}</td>
                                            <td>{p.content || "—"}</td>
                                            <td>{p.clos || "—"}</td>
                                            <td style={{ whiteSpace: "pre-wrap" }}>{p.teaching || "—"}</td>
                                            <td>{p.assessment || "—"}</td>
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
    );
}
