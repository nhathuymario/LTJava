import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../assets/css/pages/lecturer.css";
import { reviewCommentApi, type CommentResponse } from "../../../services/reviewComments";
import { getToken, hasRole } from "../../../services/auth";

function fmt(dt?: string) {
    if (!dt) return "";
    const hasTZ = /Z$|[+-]\d{2}:\d{2}$/.test(dt);
    const d = hasTZ ? new Date(dt) : new Date(dt + "Z");
    return Number.isNaN(d.getTime()) ? dt : d.toLocaleString();
}

export default function LecturerSyllabusReviewsPage() {
    const nav = useNavigate();
    const { id } = useParams();
    const syllabusId = Number(id);

    const [items, setItems] = useState<CommentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const canAccess = hasRole("LECTURER") || hasRole("HOD") || hasRole("AA");

    const fetchAll = async () => {
        setLoading(true);
        setErr(null);
        try {
            const data = await reviewCommentApi.listForLecturerSyllabus(syllabusId);
            setItems(data || []);
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Không tải được review/comments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) {
            setErr("Bạn chưa đăng nhập.");
            setLoading(false);
            return;
        }
        if (!canAccess) {
            setErr("Bạn không có quyền truy cập.");
            setLoading(false);
            return;
        }
        if (!syllabusId || Number.isNaN(syllabusId)) {
            setErr("SyllabusId không hợp lệ.");
            setLoading(false);
            return;
        }
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [syllabusId]);

    const sorted = useMemo(() => {
        return [...items].sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
    }, [items]);

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button className="lec-link" onClick={() => nav(-1)}>← Quay lại</button>

                    <div className="course-detail-header">
                        <div className="course-detail-title">Reviews / Comments</div>
                        <div className="course-detail-desc">Syllabus #{syllabusId}</div>
                    </div>

                    <div className="lec-toolbar">
                        <button className="lec-link" onClick={fetchAll} disabled={loading}>↻ Refresh</button>
                    </div>

                    {loading && <div className="lec-empty">Đang tải...</div>}
                    {err && <div className="lec-empty">❌ {err}</div>}

                    {!loading && !err && (
                        <div style={{ marginTop: 8 }}>
                            {sorted.length === 0 ? (
                                <div className="lec-empty">Chưa có review nào.</div>
                            ) : (
                                sorted.map((c) => (
                                    <div
                                        key={c.id}
                                        style={{
                                            border: "1px solid #e6e6e6",
                                            borderRadius: 10,
                                            padding: 12,
                                            marginBottom: 10,
                                        }}
                                    >
                                        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>
                                            <b>{c.commenterName || `User#${c.commenterId}`}</b>
                                            {c.createdAt ? ` • ${fmt(c.createdAt)}` : ""}
                                        </div>
                                        <div style={{ whiteSpace: "pre-wrap" }}>{c.content}</div>
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
