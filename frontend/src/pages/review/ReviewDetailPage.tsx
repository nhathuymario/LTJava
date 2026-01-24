import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../assets/css/pages/hod.css";

import { getToken, hasRole } from "../../services/auth";
import { reviewApi, type ReviewAssignment } from "../../services/review";
import { reviewCommentApi, type CommentResponse } from "../../services/reviewComments";

export default function ReviewDetailPage() {
    const nav = useNavigate();
    const { assignmentId } = useParams();
    const id = Number(assignmentId);

    const [a, setA] = useState<ReviewAssignment | null>(null);
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const canReview = hasRole("LECTURER") || hasRole("AA") || hasRole("HOD");

    const fetchAll = async () => {
        setLoading(true);
        setErr(null);
        try {
            // BE hiện chưa có GET /api/reviewer/reviews/{id}
            // => tạm thời lấy từ list my rồi find
            const my = await reviewApi.my();
            const found = (my || []).find(x => x.id === id) || null;
            setA(found);

            const c = await reviewCommentApi.list(id);
            setComments(c || []);
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Không tải được review");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) { setErr("Bạn chưa đăng nhập."); setLoading(false); return; }
        if (!canReview) { setErr("Bạn không có quyền truy cập."); setLoading(false); return; }
        if (!id) { setErr("assignmentId không hợp lệ."); setLoading(false); return; }
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const canAction = useMemo(() => {
        if (!a) return false;
        return a.status !== "DONE" && a.status !== "CANCELLED";
    }, [a]);

    const start = async () => {
        if (!a) return;
        try {
            const updated = await reviewApi.start(a.id);
            setA(updated);
        } catch (e: any) {
            alert(e?.response?.data?.message || "Start thất bại");
        }
    };

    const done = async () => {
        if (!a) return;
        if (!window.confirm("Đánh dấu DONE?")) return;
        try {
            const updated = await reviewApi.done(a.id);
            setA(updated);
        } catch (e: any) {
            alert(e?.response?.data?.message || "Done thất bại");
        }
    };

    const addComment = async () => {
        const text = content.trim();
        if (!text) return;
        try {
            const newC = await reviewCommentApi.add(id, text);
            setComments(prev => [...prev, newC]);
            setContent("");
        } catch (e: any) {
            alert(e?.response?.data?.message || "Comment thất bại");
        }
    };

    if (loading) return <div className="lec-empty">Đang tải...</div>;
    if (err) return <div className="lec-empty">❌ {err}</div>;
    if (!a) return <div className="lec-empty">Không tìm thấy assignment</div>;

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button className="lec-link" onClick={() => nav("/reviews")}>← Quay lại</button>

                    <div className="course-detail-header">
                        <div className="course-detail-title">Assignment #{a.id}</div>
                        <div className="course-detail-desc">
                            Status: <b>{a.status}</b> • Due: <b>{a.dueAt ? new Date(a.dueAt).toLocaleString() : "-"}</b>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        <button className="lec-link" onClick={fetchAll}>↻ Refresh</button>
                        {canAction && a.status === "ASSIGNED" && (
                            <button className="lec-link" onClick={start}>Start</button>
                        )}
                        {canAction && (
                            <button className="lec-link" onClick={done}>Done</button>
                        )}
                    </div>

                    <hr style={{ margin: "12px 0" }} />

                    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        <input
                            className="lec-search"
                            placeholder={canAction ? "Nhập góp ý..." : "Review đã kết thúc"}
                            value={content}
                            disabled={!canAction}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <button className="lec-link" disabled={!canAction} onClick={addComment}>
                            Gửi
                        </button>
                    </div>

                    <div className="syllabus-folder-list">
                        {comments.length === 0 ? (
                            <div className="lec-empty">Chưa có comment.</div>
                        ) : (
                            comments.map((c) => (
                                <div key={c.id} className="syllabus-folder">
                                    <div className="syllabus-left">
                                        <div className="syllabus-folder-icon">💬</div>
                                        <div className="syllabus-folder-name">
                                            {c.commenterName || `User#${c.commenterId}`}
                                            <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                      </span>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 8 }}>{c.content}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
