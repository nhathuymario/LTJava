import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../assets/css/pages/lecturer.css";

import { hasRole, getToken } from "../../../services/auth";
import { studentApi, type Course } from "../../../services/student";

type SortKey = "name_asc" | "name_desc";

export default function StudentRegisterCoursePage() {
    const nav = useNavigate();

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [sort, setSort] = useState<SortKey>("name_asc");

    const isStudent = hasRole("STUDENT");

    // ===== fetch available courses =====
    const fetchCourses = async () => {
        setLoading(true);
        setErr(null);
        try {
            const data = await studentApi.availableCourses();
            setCourses(data || []);
        } catch (e: any) {
            const status = e?.response?.status;
            if (status === 401 || status === 403) {
                setErr("Bạn không có quyền hoặc phiên đăng nhập hết hạn.");
            } else {
                setErr(e?.response?.data?.message || e?.message || "Không tải được danh sách môn học");
            }
        } finally {
            setLoading(false);
        }
    };

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
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStudent]);

    // ===== đăng ký course =====
    const handleRegister = async (courseId: number) => {
        if (!window.confirm("Bạn có chắc muốn đăng ký môn học này?")) return;
        try {
            await studentApi.subscribeCourse(courseId);
            alert("Đăng ký môn học thành công!");
            // reload danh sách
            fetchCourses();
        } catch (e: any) {
            alert(e?.response?.data?.message || e?.message || "Đăng ký thất bại");
        }
    };

    // ===== filter + sort =====
    const view = useMemo(() => {
        const key = q.trim().toLowerCase();
        let list = courses.filter(c =>
            `${c.code || ""} ${c.name || ""} ${c.department || ""}`.toLowerCase().includes(key)
        );
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
                <h1 className="lec-title">Đăng ký môn học</h1>

                <div className="lec-card">
                    <div className="lec-toolbar">
                        <input
                            className="lec-search"
                            placeholder="Tìm môn học"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />

                        <select
                            className="lec-select"
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortKey)}
                        >
                            <option value="name_asc">Sort A → Z</option>
                            <option value="name_desc">Sort Z → A</option>
                        </select>

                        <button
                            className="lec-select"
                            style={{ cursor: "pointer" }}
                            onClick={() => nav("/student")}
                        >
                            ← Quay lại
                        </button>
                    </div>

                    {loading && <div className="lec-empty">Đang tải...</div>}
                    {err && <div className="lec-empty">❌ {err}</div>}

                    {!loading && !err && (
                        <div className="lec-list">
                            {view.length === 0 ? (
                                <div className="lec-empty">Không còn môn học nào để đăng ký.</div>
                            ) : (
                                view.map((c, idx) => (
                                    <div key={c.id} className="course-row">
                                        <div className={`course-thumb thumb-${idx % 4}`} />

                                        <div className="course-info">
                                            <div className="course-name">
                                                [{c.code || "N/A"}] - {c.name}
                                            </div>
                                            <div className="course-sub">
                                                {c.department || "Chưa có khoa"}
                                            </div>
                                        </div>

                                        <button
                                            className="lec-select"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleRegister(c.id)}
                                        >
                                            ➕ Đăng ký
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
