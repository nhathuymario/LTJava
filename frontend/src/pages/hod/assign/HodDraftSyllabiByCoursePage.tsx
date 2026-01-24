import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "../../../assets/css/pages/hod.css";
import { getToken, hasRole } from "../../../services/auth";
import { hodApi } from "../../../services/hod";
import type { Syllabus, SyllabusStatus } from "../../../services/syllabus";

export default function HodDraftSyllabiByCoursePage() {
    const nav = useNavigate();
    const { courseId } = useParams();
    const [sp] = useSearchParams();

    const status = (sp.get("status") as SyllabusStatus) || "DRAFT";
    const cid = Number(courseId);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<Syllabus[]>([]);
    const [q, setQ] = useState("");
    const [openId, setOpenId] = useState<number | null>(null);

    useEffect(() => {
        const token = getToken();
        if (!token) { setError("Bạn chưa đăng nhập."); setLoading(false); return; }
        if (!hasRole("HOD")) { setError("Bạn không có quyền (HOD)."); setLoading(false); return; }
        if (!cid || Number.isNaN(cid)) { setError("courseId không hợp lệ."); setLoading(false); return; }

        (async () => {
            try {
                setLoading(true);
                const data = await hodApi.listSyllabiByCourseAndStatus(cid, status);
                setItems(data || []);
            } catch (e: any) {
                setError(e?.response?.data?.message || "Không tải được syllabus theo course.");
            } finally {
                setLoading(false);
            }
        })();
    }, [cid, status]);

    const filtered = useMemo(() => {
        const k = q.trim().toLowerCase();
        if (!k) return items;
        return items.filter((s) =>
            (s.title || "").toLowerCase().includes(k) ||
            (s.createdBy?.fullName || s.createdBy?.username || "").toLowerCase().includes(k) ||
            (s.academicYear || "").toLowerCase().includes(k) ||
            (s.semester || "").toLowerCase().includes(k)
        );
    }, [q, items]);

    return (
        <div className="lec-page">
            <div className="lec-container">
                <h1 className="lec-title">HoD • Syllabus ({status})</h1>

                <div className="lec-card">
                    <div className="lec-toolbar" style={{ gap: 12 }}>
                        <button className="lec-link" onClick={() => nav("/hod/collab")}>
                            ← Quay lại
                        </button>

                        <input
                            className="lec-search"
                            placeholder="Tìm kiếm syllabus (title / giảng viên / năm / kỳ)"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />

                    </div>

                    {error && <div className="lec-empty">❌ {error}</div>}
                    {loading && <div className="lec-empty">Đang tải...</div>}

                    {!loading && !error && (
                        <div className="lec-list">
                            {filtered.length === 0 ? (
                                <div className="lec-empty">Không có syllabus {status} cho course này.</div>
                            ) : (
                                filtered.map((s, idx) => {
                                    const isOpen = openId === s.id;
                                    return (
                                        <div
                                            key={s.id}
                                            className="course-row"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => setOpenId(isOpen ? null : s.id)}
                                        >
                                            <div className={`course-thumb thumb-${idx % 4}`} />

                                            <div className="course-info" style={{ width: "100%" }}>
                                                <div className="course-name">
                                                    {s.title} <span style={{ opacity: 0.7 }}>(v{s.version})</span>
                                                </div>

                                                <div className="course-sub">
                                                    {s.createdBy?.fullName || s.createdBy?.username || "Chưa rõ giảng viên"}
                                                    {" • "}
                                                    {s.academicYear || "N/A"} {s.semester ? `• ${s.semester}` : ""}
                                                    {" • "}
                                                    <b>{s.status}</b>
                                                    {s.updatedAt ? ` • cập nhật: ${new Date(s.updatedAt).toLocaleString()}` : ""}
                                                </div>

                                                {isOpen && (
                                                    <div style={{ marginTop: 10 }}>
                                                        {s.description && (
                                                            <div style={{ marginBottom: 8 }}>
                                                                <b>Mô tả:</b> {s.description}
                                                            </div>
                                                        )}

                                                        {s.aiSummary && (
                                                            <div style={{ marginBottom: 8 }}>
                                                                <b>AI Summary:</b> {s.aiSummary}
                                                            </div>
                                                        )}

                                                        {s.keywords && (
                                                            <div style={{ marginBottom: 8 }}>
                                                                <b>Keywords:</b> {s.keywords}
                                                            </div>
                                                        )}

                                                        {s.editNote && (
                                                            <div style={{ marginBottom: 8 }}>
                                                                <b>Edit note:</b> {s.editNote}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                className="course-more"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenId(isOpen ? null : s.id);
                                                }}
                                                style={{ whiteSpace: "nowrap" }}
                                            >
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
