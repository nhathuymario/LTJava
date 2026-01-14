import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../../assets/css/hod.css";

import { hasRole, getToken } from "../../services/auth";
import { hodApi } from "../../services/hod";
import type { Syllabus } from "../../services/syllabus";

export default function HodCourseDetailPage() {
    const nav = useNavigate();
    const { courseId } = useParams();
    const id = Number(courseId);

    const loc = useLocation() as any;
    const initialCourse = loc.state?.course;
    const initialSyllabi: Syllabus[] = loc.state?.syllabi || [];

    const [syllabi, setSyllabi] = useState<Syllabus[]>(initialSyllabi);
    const [loading, setLoading] = useState(initialSyllabi.length === 0);
    const [error, setError] = useState<string | null>(null);

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const isHod = hasRole("HOD");
    const toggleMenu = (sid: number) => setOpenMenuId((p) => (p === sid ? null : sid));

    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) {
            setError("Bạn chưa đăng nhập (thiếu token).");
            setLoading(false);
            return;
        }
        if (!isHod) {
            setError("Bạn không có quyền truy cập (HOD).");
            setLoading(false);
            return;
        }
        if (!id) {
            setError("courseId không hợp lệ.");
            setLoading(false);
            return;
        }

        // Refresh trang -> fetch lại SUBMITTED và filter theo courseId
        if (initialSyllabi.length > 0) return;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const list = await hodApi.listByStatus("SUBMITTED");
                const filtered = (list || []).filter((s: any) => Number(s?.course?.id) === id);
                setSyllabi(filtered);
            } catch (err: any) {
                const resp = err?.response?.data;
                const msg = resp?.message || resp || err?.message || "Không tải được syllabus cho course";
                setError(typeof msg === "string" ? msg : "Không tải được dữ liệu");
            } finally {
                setLoading(false);
            }
        })();
    }, [id, isHod, initialSyllabi.length]);

    const approve = async (sid: number) => {
        if (!window.confirm("HoD duyệt syllabus này?")) return;
        try {
            await hodApi.approve(sid);
            setSyllabi((prev) => prev.map((s: any) => (s.id === sid ? { ...s, status: "HOD_APPROVED" } : s)));
            setOpenMenuId(null);
        } catch (err: any) {
            alert(err?.response?.data?.message || "Approve thất bại");
        }
    };

    const requestEdit = async (sid: number) => {
        const note = window.prompt("Nhập nội dung yêu cầu chỉnh sửa:");
        if (!note || !note.trim()) return;

        try {
            await hodApi.requestEdit(sid, note.trim());
            setSyllabi((prev) =>
                prev.map((s: any) => (s.id === sid ? { ...s, status: "REQUESTEDIT", editNote: note.trim() } : s))
            );
            setOpenMenuId(null);
        } catch (err: any) {
            alert(err?.response?.data?.message || "Request edit thất bại");
        }
    };

    const reject = async (sid: number) => {
        const note = window.prompt("Lý do từ chối (có thể bỏ trống):") || "";
        if (!window.confirm("Từ chối syllabus này?")) return;

        try {
            await hodApi.reject(sid, note.trim());
            setSyllabi((prev) =>
                prev.map((s: any) => (s.id === sid ? { ...s, status: "REJECTED", editNote: note.trim() } : s))
            );
            setOpenMenuId(null);
        } catch (err: any) {
            alert(err?.response?.data?.message || "Reject thất bại");
        }
    };

    const courseTitle = initialCourse
        ? `[${initialCourse.code || "NO_CODE"}] - ${initialCourse.name || `Course #${id}`}`
        : `Course #${id}`;

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button className="lec-link" onClick={() => nav("/hod")}>
                        ← Quay lại
                    </button>

                    <div className="course-detail-header">
                        <div className="course-detail-title">{courseTitle}</div>
                        <div className="course-detail-desc">HoD duyệt các syllabus đang SUBMITTED cho course này</div>
                    </div>

                    {loading && <div className="lec-empty">Đang tải...</div>}
                    {error && <div className="lec-empty">❌ {error}</div>}

                    {!loading && !error && (
                        <div className="syllabus-folder-list">
                            {syllabi.length === 0 ? (
                                <div className="lec-empty">Course này không có syllabus SUBMITTED.</div>
                            ) : (
                                syllabi.map((s: any) => (
                                    <div key={s.id} className="syllabus-folder">
                                        <div className="syllabus-left">
                                            <div className="syllabus-folder-icon">📁</div>
                                            <div className="syllabus-folder-name">
                                                {s.title}
                                                <span className={`syllabus-status status-${String(s.status || "").toLowerCase()}`}>
                          {s.status}
                        </span>
                                            </div>
                                        </div>

                                        <div className="syllabus-actions">
                                            <button
                                                className="syllabus-more"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleMenu(s.id);
                                                }}
                                            >
                                                ⋮
                                            </button>

                                            {openMenuId === s.id && (
                                                <div className="syllabus-menu">
                                                    {s.status === "SUBMITTED" ? (
                                                        <>
                                                            <button className="syllabus-menu-item" onClick={() => approve(s.id)}>
                                                                ✅ Approve
                                                            </button>
                                                            <button className="syllabus-menu-item" onClick={() => requestEdit(s.id)}>
                                                                ✍️ Request edit
                                                            </button>
                                                            <button className="syllabus-menu-item" onClick={() => reject(s.id)}>
                                                                ❌ Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button className="syllabus-menu-item" onClick={() => setOpenMenuId(null)}>
                                                            Đóng
                                                        </button>
                                                    )}
                                                </div>
                                            )}
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
