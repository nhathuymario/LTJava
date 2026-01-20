import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/pages/lecturer.css";

import { roleHomeMap } from "../../utils/roleHome";
import {getRoles, getToken, hasRole } from "../../services/auth";
import { reviewApi, type ReviewAssignment, type ReviewStatus } from "../../services/review";

const STATUSES: (ReviewStatus | "ALL")[] = ["ALL", "ASSIGNED", "IN_REVIEW", "DONE", "CANCELLED"];

export default function ReviewerMyReviewsPage() {
    const nav = useNavigate();
    const [items, setItems] = useState<ReviewAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [status, setStatus] = useState<ReviewStatus | "ALL">("ALL");

    const canReview = hasRole("LECTURER") || hasRole("AA") || hasRole("HOD");

    const fetchMy = async () => {
        setLoading(true);
        setErr(null);
        try {
            const data = await reviewApi.my(status === "ALL" ? undefined : status);
            setItems(data || []);
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Không tải được danh sách review");
        } finally {
            setLoading(false);
        }
    };

    const goBackByRole = () => {
        const roles = getRoles();
        for (const r of roles) {
            if (roleHomeMap[r]) {
                nav(roleHomeMap[r]);
                return;
            }
        }
        nav("/");
    };


    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) { setErr("Bạn chưa đăng nhập."); setLoading(false); return; }
        if (!canReview) { setErr("Bạn không có quyền truy cập."); setLoading(false); return; }
        fetchMy();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const sorted = useMemo(() => {
        return [...items].sort((a, b) => (a.dueAt || "").localeCompare(b.dueAt || ""));
    }, [items]);

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button className="lec-link" onClick={goBackByRole}>
                        ← Quay lại
                    </button>


                    <div className="course-detail-header">
                        <div className="course-detail-title">My Review Assignments</div>
                        <div className="course-detail-desc">Danh sách syllabus được giao review</div>
                    </div>

                    <div className="lec-toolbar">
                        <select className="lec-select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button className="lec-link" onClick={fetchMy}>↻ Refresh</button>
                    </div>

                    {loading && <div className="lec-empty">Đang tải...</div>}
                    {err && <div className="lec-empty">❌ {err}</div>}

                    {!loading && !err && (
                        <div className="syllabus-folder-list">
                            {sorted.length === 0 ? (
                                <div className="lec-empty">Không có assignment.</div>
                            ) : (
                                sorted.map((a) => (
                                    <div
                                        key={a.id}
                                        className="syllabus-folder"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => nav(`/reviews/${a.id}`)}
                                    >
                                        <div className="syllabus-left">
                                            <div className="syllabus-folder-icon">📌</div>
                                            <div className="syllabus-folder-name">
                                                Assignment #{a.id}
                                                <span className={`syllabus-status status-${String(a.status || "").toLowerCase()}`}>
                          {a.status}
                        </span>
                                            </div>
                                        </div>

                                        <div style={{ fontSize: 13, opacity: 0.8 }}>
                                            Due: {a.dueAt ? new Date(a.dueAt).toLocaleString() : "-"}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
