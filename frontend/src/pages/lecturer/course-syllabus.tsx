import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./lecturer.css";

import { hasRole, getToken } from "../../services/auth";
import { getSyllabusByCourse, type Syllabus } from "../../services/syllabus";
import { getCourseById, type Course } from "../../services/course"; // bạn tạo thêm getCourseById ở services/course.ts

export default function LecturerCourseSyllabusPage() {
    const nav = useNavigate();
    const { courseId } = useParams();
    const id = Number(courseId);

    const [course, setCourse] = useState<Course | null>(null);
    const [items, setItems] = useState<Syllabus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isLecturer = hasRole("LECTURER");

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [c, syl] = await Promise.all([
                getCourseById(id),
                getSyllabusByCourse(id),
            ]);
            setCourse(c);
            setItems(syl);
        } catch (err: any) {
            const status = err?.response?.status;
            const resp = err?.response?.data;
            console.error("load course syllabus failed:", status, resp);

            const msg =
                resp?.message ||
                resp ||
                err?.message ||
                "Không tải được danh sách giáo trình của môn này";
            setError(typeof msg === "string" ? msg : "Không tải được dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) {
            setError("Bạn chưa đăng nhập (thiếu token).");
            setLoading(false);
            return;
        }
        if (!isLecturer) {
            setError("Bạn không có quyền LECTURER.");
            setLoading(false);
            return;
        }
        if (!id) {
            setError("courseId không hợp lệ.");
            setLoading(false);
            return;
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isLecturer]);

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <button className="lec-link" onClick={() => nav("/lecturer")}>← Quay lại</button>
                        {/* nút thêm giáo trình làm sau */}
                    </div>

                    <h2 className="lec-section-title" style={{ marginTop: 10 }}>
                        {course ? `Giáo trình: [${course.code}] ${course.name}` : "Giáo trình"}
                    </h2>

                    {error && <div className="lec-empty">❌ {error}</div>}
                    {loading && <div className="lec-empty">Đang tải...</div>}

                    {!loading && !error && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "10px 0 18px" }}>
                            {items.length === 0 ? (
                                <div className="lec-empty">Chưa có giáo trình nào cho môn này.</div>
                            ) : (
                                items.map((s) => (
                                    <div key={s.id} className="folder-card">
                                        <div className="folder-icon">📁</div>
                                        <div className="folder-title">{s.title}</div>
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
