import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../../assets/css/aa.css";

import { hasRole, getToken } from "../../services/auth";
import { aaApi } from "../../services/aa";
import type { Syllabus, SyllabusStatus } from "../../services/syllabus";

export default function AACourseDetailPage() {
    const nav = useNavigate();
    const { courseId } = useParams();
    const id = Number(courseId);

    const loc = useLocation() as any;
    const initialCourse = loc.state?.course;
    const initialSyllabi: Syllabus[] = loc.state?.syllabi || [];
    const initialStatus: SyllabusStatus = loc.state?.status || "HOD_APPROVED";

    const [syllabi, setSyllabi] = useState<Syllabus[]>(initialSyllabi);
    const [loading, setLoading] = useState(initialSyllabi.length === 0);
    const [error, setError] = useState<string | null>(null);

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const isAA = hasRole("AA");
    const toggleMenu = (sid: number) => setOpenMenuId((p) => (p === sid ? null : sid));

    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) {
            setError("Bạn chưa đăng nhập (thiếu token).");
            setLoading(false);
            return;
        }
        if (!isAA) {
            setError("Bạn không có quyền truy cập (AA).");
            setLoading(false);
            return;
        }
        if (!id) {
            setError("courseId không hợp lệ.");
            setLoading(false);
            return;
        }

        // refresh trang -> fetch lại theo status ban đầu
        if (initialSyllabi.length > 0) return;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const list = await aaApi.listByStatus(initialStatus);
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
    }, [id, isAA, initialSyllabi.length, initialStatus]);

    const approve = async (sid: number) => {
        if (!window.confirm("AA duyệt syllabus này?")) return;
        try {
            await aaApi.approve(sid);
            setSyllabi((prev) => prev.map((s: any) => (s.id === sid ? { ...s, status: "AA_APPROVED" } : s)));
            setOpenMenuId(null);
        } catch (err: any) {
            alert(err?.response?.data?.message || "Approve thất bại");
        }
    };

    const reject = async (sid: number) => {
        const note = window.prompt("Lý do reject (có thể bỏ trống):") || "";
        if (!window.confirm("Reject syllabus này?")) return;
        try {
            await aaApi.reject(sid, note.trim());
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
                    <button className="lec-link" onClick={() => nav("/aa")}>
                        ← Quay lại
                    </button>

                    <div className="course-detail-header">
                        <div className="course-detail-title">{courseTitle}</div>
                        <div className="course-detail-desc">AA xử lý syllabus theo trạng thái: {initialStatus}</div>
                    </div>

                    {loading && <div className="lec-empty">Đang tải...</div>}
                    {error && <div className="lec-empty">❌ {error}</div>}

                    {!loading && !error && (
                        <div className="syllabus-folder-list">
                            {syllabi.length === 0 ? (
                                <div className="lec-empty">Course này không có syllabus phù hợp trạng thái.</div>
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
                                                    {s.status === "HOD_APPROVED" && (
                                                        <>
                                                            <button className="syllabus-menu-item" onClick={() => approve(s.id)}>
                                                                ✅ Approve (AA)
                                                            </button>
                                                            <button className="syllabus-menu-item" onClick={() => reject(s.id)}>
                                                                ❌ Reject
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* AA không publish nữa -> Principal publish */}
                                                    {s.status !== "HOD_APPROVED" && (
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
