import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../assets/css/pages/hod.css";

import { getToken, hasRole } from "../../services/auth";
import { hodApi } from "../../services/hod";
import { reviewApi } from "../../services/review";
import type { Syllabus } from "../../services/syllabus";

export default function HodAssignReviewPage() {
    const nav = useNavigate();
    const [sp] = useSearchParams();
    const courseId = Number(sp.get("courseId") || 0);

    const [drafts, setDrafts] = useState<Syllabus[]>([]);
    const [selectedId, setSelectedId] = useState<number>(0);

    const [reviewers, setReviewers] = useState("");
    const [dueAt, setDueAt] = useState(""); // datetime-local

    const [loading, setLoading] = useState(false);
    const [loadingDrafts, setLoadingDrafts] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        const token = getToken();
        if (!token) { setErr("Bạn chưa đăng nhập."); return; }
        if (!hasRole("HOD")) { setErr("Bạn không có quyền (HOD)."); return; }
        if (!courseId) { setErr("Thiếu courseId."); return; }

        (async () => {
            setLoadingDrafts(true);
            setErr(null);
            try {
                const data = await hodApi.listSyllabiByCourseAndStatus(courseId, "DRAFT");
                setDrafts(data || []);
                if (data?.length) setSelectedId(Number(data[0].id));
            } catch (e: any) {
                setErr(e?.response?.data?.message || "Không tải được syllabus DRAFT");
            } finally {
                setLoadingDrafts(false);
            }
        })();
    }, [courseId]);

    const syllabusId = useMemo(() => selectedId, [selectedId]);

    const submit = async () => {
        setErr(null);

        if (!syllabusId) { setErr("Chưa chọn syllabus DRAFT."); return; }

        const list = reviewers
            .split(/[\n,]/g)
            .map((s) => s.trim())
            .filter(Boolean);

        if (list.length === 0) { setErr("Thiếu reviewer usernames (CCCD)."); return; }
        if (!dueAt) { setErr("Thiếu hạn chót (dueAt)."); return; }

        const dueIso = new Date(dueAt).toISOString();

        try {
            setLoading(true);
            await reviewApi.assign({ syllabusId, reviewerUsernames: list, dueAt: dueIso });
            alert("Assign thành công");
            nav("/hod");
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Assign thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button className="lec-link" onClick={() => nav("/hod")}>← Quay lại</button>

                    <div className="course-detail-header">
                        <div className="course-detail-title">Assign Collaborative Review</div>
                        <div className="course-detail-desc">
                            Chọn syllabus DRAFT theo course, nhập reviewer username (=CCCD), đặt deadline.
                        </div>
                    </div>

                    {err && <div className="lec-empty">❌ {err}</div>}

                    <div style={{ display: "grid", gap: 10, maxWidth: 720 }}>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>
                            CourseId: <b>{courseId}</b>
                        </div>

                        <select
                            className="lec-select"
                            value={selectedId || ""}
                            disabled={loadingDrafts || drafts.length === 0}
                            onChange={(e) => setSelectedId(Number(e.target.value))}
                        >
                            {loadingDrafts ? (
                                <option value="">Đang tải syllabus DRAFT...</option>
                            ) : drafts.length === 0 ? (
                                <option value="">Không có syllabus DRAFT</option>
                            ) : (
                                drafts.map((s: any) => (
                                    <option key={s.id} value={s.id}>
                                        #{s.id} • {s.title} • v{s.version}
                                    </option>
                                ))
                            )}
                        </select>

                        <textarea
                            className="lec-search"
                            style={{ minHeight: 120, whiteSpace: "pre-wrap" }}
                            placeholder="Reviewer usernames (CCCD) - cách nhau bằng dấu phẩy hoặc xuống dòng"
                            value={reviewers}
                            onChange={(e) => setReviewers(e.target.value)}
                        />

                        <input
                            className="lec-search"
                            type="datetime-local"
                            value={dueAt}
                            onChange={(e) => setDueAt(e.target.value)}
                        />

                        <button className="lec-link" disabled={loading || drafts.length === 0} onClick={submit}>
                            {loading ? "Đang assign..." : "Assign"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
