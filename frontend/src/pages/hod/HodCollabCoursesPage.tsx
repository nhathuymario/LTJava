import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/pages/hod.css";
import { getToken, hasRole } from "../../services/auth";
import { hodApi, type HodCourseGroup } from "../../services/hod";

export default function HodCollabCoursesPage() {
    const nav = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [courses, setCourses] = useState<HodCourseGroup[]>([]);
    const [q, setQ] = useState("");

    useEffect(() => {
        const token = getToken();
        if (!token) { setError("Bạn chưa đăng nhập."); setLoading(false); return; }
        if (!hasRole("HOD")) { setError("Bạn không có quyền (HOD)."); setLoading(false); return; }

        (async () => {
            try {
                setLoading(true);
                const data = await hodApi.listCoursesHavingSyllabusStatus("DRAFT");

                setCourses(data || []);
            } catch (e: any) {
                setError(e?.response?.data?.message || "Không tải được course DRAFT");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        const k = q.trim().toLowerCase();
        if (!k) return courses;
        return courses.filter(c =>
            (c.code || "").toLowerCase().includes(k) ||
            (c.name || "").toLowerCase().includes(k)
        );
    }, [q, courses]);

    return (
        <div className="lec-page">
            <div className="lec-container">
                <h1 className="lec-title">HoD • Cộng tác (DRAFT)</h1>

                <div className="lec-card">
                    <h2 className="lec-section-title">Các course có syllabus DRAFT</h2>

                    <div className="lec-toolbar">
                        <select className="lec-select" defaultValue="DRAFT" disabled>
                            <option value="DRAFT">DRAFT</option>
                        </select>

                        <input
                            className="lec-search"
                            placeholder="Tìm kiếm course"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>

                    {error && <div className="lec-empty">❌ {error}</div>}
                    {loading && <div className="lec-empty">Đang tải...</div>}

                    {!loading && !error && (
                        <div className="lec-list">
                            {filtered.length === 0 ? (
                                <div className="lec-empty">Không có course nào có syllabus DRAFT.</div>
                            ) : (
                                filtered.map((c, idx) => (
                                    <div
                                        key={c.courseId}
                                        className="course-row"
                                        style={{ cursor: "pointer" }}
                                        // onClick={() => nav(`/hod/reviews/assign?courseId=${c.courseId}`)}
                                    >
                                        <div className={`course-thumb thumb-${idx % 4}`} />

                                        <div className="course-info">
                                            <div className="course-name">
                                                [{c.code || "NO_CODE"}] - {c.name || `Course #${c.courseId}`}
                                            </div>
                                            <div className="course-sub">
                                                {c.department ? `[CQ]_${c.department}` : "Chưa có khoa/department"} • {c.count} syllabus DRAFT
                                            </div>
                                        </div>

                                        <button
                                            className="course-more"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                nav(`/hod/reviews/assign?courseId=${c.courseId}`);
                                            }}
                                        >
                                            🧩 Assign
                                        </button>
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
