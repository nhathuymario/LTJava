import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../assets/css/pages/lecturer.css";
import { hasRole, getToken } from "../../../services/auth";
import type { Syllabus } from "../../../services/syllabus";
import { lecturerApi } from "../../../services/lecturer";
import type { CourseOutcomes } from "./types";
import { createEmptyCourseOutcomes } from "./defaults";
import CloPloMatrixView from "./CloPloMatrixView";

export default function LecturerSyllabusDetailPage() {
    const nav = useNavigate();
    const { syllabusId } = useParams<{ syllabusId: string }>();

    const sid = useMemo(() => {
        const n = Number(syllabusId);
        return Number.isFinite(n) ? n : null;
    }, [syllabusId]);

    const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
    const [content, setContent] = useState<CourseOutcomes>(() => createEmptyCourseOutcomes());

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const token = getToken();
    const isLecturer = hasRole("LECTURER") || hasRole("ROLE_LECTURER");

    useEffect(() => {
        if (!token) {
            nav("/login", { replace: true });
            return;
        }
        if (!isLecturer) {
            setErr("Bạn không có quyền truy cập trang này (LECTURER).");
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
            try {
                // 1) detail
                const s = await lecturerApi.detail(sid);
                if (cancelled) return;
                setSyllabus(s);

                // 2) content (để render giống Word)
                const c = await lecturerApi.getCourseOutcomes(sid);
                if (cancelled) return;

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
                setErr(e?.response?.data?.message || e?.message || "Không tải được chi tiết syllabus");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [token, isLecturer, sid, nav]);

    if (!token) {
        return (
            <div className="lec-page">
                <div className="lec-container">
                    <div className="lec-card">Redirecting to login...</div>
                </div>
            </div>
        );
    }

    if (token && !isLecturer) {
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
                        <div>Bạn không có quyền (LECTURER) để truy cập trang này.</div>
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

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="manage-toolbar">
                    <button className="lec-btn" onClick={() => nav("/lecturer/syllabus/" )}>
                        ← Back
                    </button>

                    <div style={{ flex: 1 }} />

                    <button className="lec-btn" disabled={loading} onClick={() => nav(`/lecturer/syllabus/${sid}/outcomes`)}>
                        Outcomes (Edit)
                    </button>
                </div>

                {loading && <div className="lec-card">Đang tải...</div>}
                {err && <div className="lec-card">❌ {err}</div>}

                {!loading && !err && syllabus && (
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
                                {syllabus.course?.name ? <>Course: <b>{syllabus.course.name}</b> · </> : null}
                                {syllabus.academicYear ? <>AY: <b>{syllabus.academicYear}</b> · </> : null}
                                {syllabus.semester ? <>Sem: <b>{syllabus.semester}</b></> : null}
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
                                        <div><b>Tiếng Việt:</b> {content.generalInfo.nameVi || "—"}</div>
                                        <div><b>Tiếng Anh:</b> {content.generalInfo.nameEn || "—"}</div>
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
                                        LT/BT: {content.generalInfo.theory || "—"} · TH/TN: {content.generalInfo.practice || "—"} ·
                                        DA/TL: {content.generalInfo.project || "—"} · Tổng: {content.generalInfo.total || "—"} ·
                                        Tự học: {content.generalInfo.selfStudy || "—"}
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
                                            <td style={{ fontWeight: 600 }}>{clo.code || `CLO${idx + 1}`}</td>
                                            <td>{clo.description || "—"}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="lec-empty">—</div>
                            )}
                        </div>

                        {/* 4.1 CLO-PLO VIEW */}
                        <CloPloMatrixView syllabusId={sid} scopeKey={content.generalInfo.scopeKey} />

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
