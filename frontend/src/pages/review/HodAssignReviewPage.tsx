import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/pages/hod.css";

import { getToken, hasRole } from "../../services/auth";
import { reviewApi } from "../../services/review";

export default function HodAssignReviewPage() {
    const nav = useNavigate();

    const [syllabusId, setSyllabusId] = useState("");
    const [reviewers, setReviewers] = useState(""); // comma/newline usernames(cccd)
    const [dueAt, setDueAt] = useState(""); // datetime-local
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const isHod = hasRole("HOD");

    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) { setErr("Bạn chưa đăng nhập."); return; }
        if (!isHod) { setErr("Bạn không có quyền (HOD)."); return; }
    }, [isHod]);

    const submit = async () => {
        setErr(null);

        const sid = Number(syllabusId);
        if (!sid) { setErr("syllabusId không hợp lệ"); return; }

        const list = reviewers
            .split(/[\n,]/g)
            .map(s => s.trim())
            .filter(Boolean);

        if (list.length === 0) { setErr("Thiếu reviewer usernames (CCCD)"); return; }
        if (!dueAt) { setErr("Thiếu dueAt"); return; }

        // datetime-local -> ISO
        const iso = new Date(dueAt).toISOString();

        try {
            setLoading(true);
            await reviewApi.assign({ syllabusId: sid, reviewerUsernames: list, dueAt: iso });
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
                            HOD assign reviewer theo username (=CCCD). Chỉ assign khi syllabus là DRAFT.
                        </div>
                    </div>

                    {err && <div className="lec-empty">❌ {err}</div>}

                    <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
                        <input
                            className="lec-search"
                            placeholder="Syllabus ID (DRAFT)"
                            value={syllabusId}
                            onChange={(e) => setSyllabusId(e.target.value)}
                        />

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

                        <button className="lec-link" disabled={loading} onClick={submit}>
                            {loading ? "Đang assign..." : "Assign"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
