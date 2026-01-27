import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../assets/css/pages/lecturer.css";
import { hasRole, getToken } from "../../../services/auth";
import type { Syllabus } from "../../../services/syllabus";
import { lecturerApi } from "../../../services/lecturer";

/**
 * Route:
 * <Route path="/lecturer/syllabus/:syllabusId" element={<LecturerSyllabusDetailPage />} />
 */
export default function LecturerSyllabusDetailPage() {
    const nav = useNavigate();
    const { syllabusId } = useParams<{ syllabusId: string }>();

    // ✅ sid: null nếu invalid, 0 vẫn hợp lệ
    const sid = useMemo(() => {
        const n = Number(syllabusId);
        return Number.isFinite(n) ? n : null;
    }, [syllabusId]);

    const [data, setData] = useState<Syllabus | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    // ✅ đọc lại mỗi render (đừng useMemo([]) ở đây)
    const token = getToken();
    const isLecturer =
        hasRole("LECTURER") || hasRole("ROLE_LECTURER");

    useEffect(() => {
        // ✅ thiếu token → đá về login (tránh đứng im)
        if (!token) {
            nav("/login", { replace: true });
            return;
        }

        // ✅ sai role → khỏi gọi API
        if (!isLecturer) {
            setErr("Bạn không có quyền truy cập trang này (LECTURER).");
            setLoading(false);
            return;
        }

        // ✅ validate param
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
                const res = await lecturerApi.detail(sid);
                if (cancelled) return;
                setData(res);
            } catch (e: any) {
                if (cancelled) return;
                setErr(
                    e?.response?.data?.message ||
                    e?.message ||
                    "Không tải được chi tiết syllabus"
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [token, isLecturer, sid, nav]);

    // ✅ đang redirect login → render message nhẹ (không trắng)
    if (!token) {
        return (
            <div className="lec-page">
                <div className="lec-container">
                    <div className="lec-card">Redirecting to login...</div>
                </div>
            </div>
        );
    }

    // ✅ sai role → show 403 (không trắng)
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

    // ✅ id invalid
    if (sid === null) {
        return (
            <div className="lec-page">
                <div className="lec-container">
                    <div className="lec-card">
                        <button className="lec-link" onClick={() => nav("/lecturer/syllabus/:id/reviews")}>
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
                <div className="lec-card">
                    <button className="lec-link" onClick={() => nav(-1)}>
                        ← Quay lại
                    </button>

                    {/* ✅ action buttons */}
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                        <button
                            className="lec-btn"
                            onClick={() => nav(`/lecturer/syllabus/${sid}/outcomes`)}
                            disabled={loading}
                        >
                            Outcomes + CLO/PLO Mapping
                        </button>
                    </div>

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
