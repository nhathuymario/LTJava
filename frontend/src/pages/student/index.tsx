import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/pages/lecturer.css";
import { hasRole, getToken } from "../../services/auth";
// hoặc ../../../services/auth tùy cấp thư mục

import { studentApi, type Course } from "../../services/student";

export default function StudentCoursesPage() {
    const nav = useNavigate();

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [sort, setSort] = useState<"name_asc" | "name_desc">("name_asc");

    const isStudent = hasRole("STUDENT") || hasRole("ROLE_STUDENT");



    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) {
            setErr("Bạn chưa đăng nhập (thiếu token).");
            setLoading(false);
            return;
        }
        if (!isStudent) {
            setErr("Bạn không có quyền truy cập trang này (STUDENT).");
            setLoading(false);
            return;
        }

        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const data = await studentApi.myCourses();
                setCourses(data || []);
            } catch (e: any) {
                const status = e?.response?.status;
                if (status === 401 || status === 403) setErr("Bạn không có quyền hoặc phiên đăng nhập hết hạn.");
                else setErr(e?.response?.data?.message || e?.message || "Không tải được course đã đăng ký");
            } finally {
                setLoading(false);
            }
        })();
    }, [isStudent]);

    const view = useMemo(() => {
        const key = q.trim().toLowerCase();
        let list = courses.filter((c) => `${c.code || ""} ${c.name || ""}`.toLowerCase().includes(key));
        list.sort((a, b) => {
            const an = (a.name || a.code || "").toLowerCase();
            const bn = (b.name || b.code || "").toLowerCase();
            return sort === "name_asc" ? an.localeCompare(bn) : bn.localeCompare(an);
        });
        return list;
    }, [courses, q, sort]);

    return (
        <div className="lec-page">
            <div className="lec-container">
                <h1 className="lec-title">Môn học đã đăng ký</h1>

                <div className="lec-card">
                    <div className="lec-toolbar">
                        <input
                            className="lec-search"
                            placeholder="Tìm course"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />

                        <select className="lec-select" value={sort} onChange={(e) => setSort(e.target.value as any)}>
                            <option value="name_asc">Sort A → Z</option>
                            <option value="name_desc">Sort Z → A</option>
                        </select>

                        <button className="lec-select" style={{ cursor: "pointer" }} onClick={() => nav("/student/notifications")}>
                            🔔 Notifications
                        </button>
                    </div>

                    {loading && <div className="lec-empty">Đang tải...</div>}
                    {err && <div className="lec-empty">❌ {err}</div>}

                    {!loading && !err && (
                        <div className="lec-list">
                            {view.length === 0 ? (
                                <div className="lec-empty">Bạn chưa đăng ký môn nào.</div>
                            ) : (
                                view.map((c, idx) => (
                                    <div
                                        key={c.id}
                                        className="course-row"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => nav(`/student/courses/${c.id}`, { state: { course: c } })}
                                    >
                                        <div className={`course-thumb thumb-${idx % 4}`} />
                                        <div className="course-info">
                                            <div className="course-name">
                                                [{c.code || "N/A"}] - {c.name || "Unnamed course"}
                                            </div>
                                            <div className="course-sub">Bấm để xem giáo trình public</div>
                                        </div>
                                        <button className="course-more" onClick={(e) => e.stopPropagation()} title="More">
                                            ⋮
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
