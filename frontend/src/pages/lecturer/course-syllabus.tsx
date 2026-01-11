import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./lecturer.css";

import { hasRole, getToken } from "../../services/auth";
import { getCourseById, type Course } from "../../services/course";
import { getSyllabusByCourse, type Syllabus } from "../../services/syllabus";

export default function LecturerCourseDetailPage() {
    const nav = useNavigate();
    const { courseId } = useParams();
    const id = Number(courseId);

    const [course, setCourse] = useState<Course | null>(null);
    const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                    getSyllabusByCourse(id),
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
                                    syllabi.map((s) => (
                                        <div key={s.id} className="syllabus-folder">
                                            <div className="syllabus-folder-icon">📁</div>
                                            <div className="syllabus-folder-name">{s.title}</div>
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
