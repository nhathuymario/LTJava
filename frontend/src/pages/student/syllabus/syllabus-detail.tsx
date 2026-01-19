import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../assets/css/pages/lecturer.css";
import { hasRole, getToken } from "../../../services/auth";
import type { Syllabus } from "../../../services/syllabus";
import { studentApi } from "../../../services/student";

export default function StudentSyllabusDetailPage() {
    const nav = useNavigate();

    // ✅ Route: /student/syllabus/:syllabusId
    const { syllabusId } = useParams<{ syllabusId: string }>();

    // ✅ parse id an toàn
    const sid = useMemo(() => {
        const n = Number(syllabusId);
        return Number.isFinite(n) ? n : NaN;
    }, [syllabusId]);

    const [data, setData] = useState<Syllabus | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const isStudent = hasRole("STUDENT") || hasRole("ROLE_STUDENT");

    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");

        // ✅ auth guard
        if (!token) {
            setErr("Bạn chưa đăng nhập (thiếu token).");
            setLoading(false);
            return;
        }
        if (!isStudent) {
            setErr("Bạn không có quyền truy cập trang này (STUDENT).");
            setLoading(false);
            return;
        }

        // ✅ validate param
        if (!Number.isFinite(sid)) {
            setErr("Syllabus ID không hợp lệ.");
            setLoading(false);
            return;
        }

        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const res = await studentApi.detail(sid);
                setData(res);
            } catch (e: any) {
                setErr(
                    e?.response?.data?.message ||
                    e?.message ||
                    "Không tải được chi tiết syllabus"
                );
            } finally {
                setLoading(false);
            }
        })();
    }, [sid, isStudent]);

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button className="lec-link" onClick={() => nav(-1)}>
                        ← Quay lại
                    </button>

                    {loading && <div className="lec-empty">Đang tải...</div>}
                    {err && <div className="lec-empty">❌ {err}</div>}

                    {!loading && !err && data && (
                        <div style={{ marginTop: 10 }}>
                            <h2 className="lec-section-title">{data.title}</h2>

                            <div style={{ color: "#6b6f76", marginBottom: 12 }}>
                                {data.course?.name ? <>Course: {data.course.name} · </> : null}
                                {data.academicYear ? <>AY: {data.academicYear} · </> : null}
                                {data.semester ? <>Sem: {data.semester}</> : null}
                            </div>

                            {data.aiSummary && (
                                <div className="lec-card" style={{ marginBottom: 12 }}>
                                    <h3 className="lec-section-title">AI Summary</h3>
                                    <div style={{ whiteSpace: "pre-wrap" }}>{data.aiSummary}</div>
                                </div>
                            )}

                            <div className="lec-card" style={{ marginBottom: 12 }}>
                                <h3 className="lec-section-title">Mô tả</h3>
                                <div style={{ whiteSpace: "pre-wrap" }}>
                                    {data.description || "Không có mô tả."}
                                </div>
                            </div>

                            {data.keywords && (
                                <div className="lec-card">
                                    <h3 className="lec-section-title">Keywords</h3>
                                    <div>{data.keywords}</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
