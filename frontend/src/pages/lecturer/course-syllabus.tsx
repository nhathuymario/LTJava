import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../assets/css/lecturer.css";

import { hasRole, getToken } from "../../services/auth";
import { getCourseById, type Course } from "../../services/course";

import { lecturerApi } from "../../services/lecturer";
import type { Syllabus } from "../../services/syllabus";

export default function LecturerCourseDetailPage() {
    const nav = useNavigate();
    const { courseId } = useParams();
    const id = Number(courseId);

    const [course, setCourse] = useState<Course | null>(null);
    const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // menu 3 chấm
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const toggleMenu = (sid: number) => setOpenMenuId((prev) => (prev === sid ? null : sid));

    const isLecturer = hasRole("LECTURER");

    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) {
            setError("Bạn chưa đăng nhập (thiếu token).");
            setLoading(false);
            return;
        }
        if (!isLecturer) {
            setError("Bạn không có quyền truy cập (LECTURER).");
            setLoading(false);
            return;
        }
        if (!id) {
            setError("courseId không hợp lệ.");
            setLoading(false);
            return;
        }

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const [c, s] = await Promise.all([
                    getCourseById(id),
                    lecturerApi.getByCourse(id), // ✅ mới
                ]);
                setCourse(c);
                setSyllabi(s);
            } catch (err: any) {
                const resp = err?.response?.data;
                const msg = resp?.message || resp || err?.message || "Không tải được dữ liệu course/syllabus";
                setError(typeof msg === "string" ? msg : "Không tải được dữ liệu");
            } finally {
                setLoading(false);
            }
        })();
    }, [id, isLecturer]);

    const handleSubmitSyllabus = async (syllabusId: number) => {
        if (!window.confirm("Bạn chắc chắn muốn submit syllabus này cho HoD?")) return;

        try {
            await lecturerApi.submit(syllabusId); // ✅ mới
            setSyllabi((prev) => prev.map((s) => (s.id === syllabusId ? { ...s, status: "SUBMITTED" } : s)));
            setOpenMenuId(null);
        } catch (err: any) {
            alert(err?.response?.data?.message || "Submit thất bại");
        }
    };

    const handleResubmitSyllabus = async (syllabusId: number) => {
        if (!window.confirm("Bạn chắc chắn muốn gửi lại syllabus này cho HoD?")) return;

        try {
            await lecturerApi.resubmit(syllabusId); // ✅ mới
            setSyllabi((prev) => prev.map((s) => (s.id === syllabusId ? { ...s, status: "SUBMITTED" } : s)));
            setOpenMenuId(null);
        } catch (err: any) {
            alert(err?.response?.data?.message || "Resubmit thất bại");
        }
    };

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button className="lec-link" onClick={() => nav("/lecturer")}>
                        ← Quay lại
                    </button>

                    {loading && <div className="lec-empty">Đang tải...</div>}
                    {error && <div className="lec-empty">❌ {error}</div>}

                    {!loading && !error && course && (
                        <>
                            {/* Header course */}
                            <div className="course-detail-header">
                                <div className="course-detail-title">
                                    [{course.code}] - {course.name}
                                </div>
                                <div className="course-detail-desc">
                                    {course.description || course.department || "Chưa có mô tả."}
                                </div>
                            </div>

                            {/* Syllabus list dạng folder */}
                            <div className="syllabus-folder-list">
                                {syllabi.length === 0 ? (
                                    <div className="lec-empty">Chưa có giáo trình nào.</div>
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
                                                        {s.status === "DRAFT" && (
                                                            <button className="syllabus-menu-item" onClick={() => handleSubmitSyllabus(s.id)}>
                                                                📤 Submit to HoD
                                                            </button>
                                                        )}

                                                        {(s.status === "REQUESTEDIT" || s.status === "REJECTED") && (
                                                            <button className="syllabus-menu-item" onClick={() => handleResubmitSyllabus(s.id)}>
                                                                🔁 Resubmit to HoD
                                                            </button>
                                                        )}

                                                        {(s.status !== "DRAFT" && s.status !== "REQUESTEDIT" && s.status !== "REJECTED") && (
                                                            <button className="syllabus-menu-item" onClick={() => setOpenMenuId(null)}>
                                                                Đóng
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Nếu muốn hiện ghi chú reject/requestedit */}
                                                {s.editNote && (
                                                    <div className="syllabus-note" style={{ marginTop: 6, fontSize: 13, opacity: 0.9 }}>
                                                        Ghi chú: {s.editNote}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
