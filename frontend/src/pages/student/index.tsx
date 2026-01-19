import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/pages/lecturer.css";
import { hasRole, getToken } from "../../services/auth";
import { studentApi, type Course } from "../../services/student";
import type { Notification } from "../../services/syllabus";

/**
 * Normalize isRead:
 * - backend có thể trả boolean true/false
 * - hoặc number 0/1
 * - hoặc string "0"/"1"
 */
const isUnread = (n: any) => {
    const v = n?.isRead;
    if (v === false) return true;
    if (v === 0) return true;
    if (v === "0") return true;
    return false;
};

export default function StudentCoursesPage() {
    const nav = useNavigate();

    const [courses, setCourses] = useState<Course[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [sort, setSort] = useState<"name_asc" | "name_desc">("name_asc");

    const isStudent = hasRole("STUDENT") || hasRole("ROLE_STUDENT");

    // Load courses + notifications (để hiện badge)
    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) {
            setErr("Bạn chưa đăng nhập.");
            setLoading(false);
            return;
        }
        if (!isStudent) {
            setErr("Bạn không có quyền (STUDENT).");
            setLoading(false);
            return;
        }

        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const [coursesRes, notiRes] = await Promise.all([
                    studentApi.myCourses(),
                    studentApi.notifications(),
                ]);

                setCourses(coursesRes || []);
                setNotifications(notiRes || []);
            } catch (e: any) {
                setErr(e?.response?.data?.message || e?.message || "Không tải được dữ liệu");
            } finally {
                setLoading(false);
            }
        })();
    }, [isStudent]);

    const unreadCount = useMemo(() => {
        return (notifications || []).filter((n: any) => isUnread(n)).length;
    }, [notifications]);

    const view = useMemo(() => {
        const key = q.trim().toLowerCase();

        const list = (courses || []).filter((c) =>
            `${c.code || ""} ${c.name || ""}`.toLowerCase().includes(key)
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
                <h1 className="lec-title">Môn học đã đăng ký</h1>

                <div className="lec-card">
                    <div className="lec-toolbar">
                        <input
                            className="lec-search"
                            placeholder="Tìm course"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />

                        <select
                            className="lec-select"
                            value={sort}
                            onChange={(e) => setSort(e.target.value as any)}
                        >
                            <option value="name_asc">A → Z</option>
                            <option value="name_desc">Z → A</option>
                        </select>

                        {/* Badge số thông báo chưa đọc */}
                        <button className="lec-select" onClick={() => nav("/student/notifications")}>
                            🔔 Notifications
                            {unreadCount > 0 && (
                                <span
                                    style={{
                                        marginLeft: 6,
                                        background: "#ef4444",
                                        color: "#fff",
                                        borderRadius: 999,
                                        padding: "2px 8px",
                                        fontSize: 12,
                                        lineHeight: "14px",
                                    }}
                                >
                  {unreadCount}
                </span>
                            )}
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
                                        onClick={() =>
                                            // Route đúng: /student/courses/:courseId
                                            nav(`/student/courses/${c.id}`, { state: { course: c } })
                                        }
                                    >
                                        <div className={`course-thumb thumb-${idx % 4}`} />
                                        <div className="course-info">
                                            <div className="course-name">
                                                [{c.code || "N/A"}] - {c.name || "Unnamed course"}
                                            </div>
                                            <div className="course-sub">Bấm để xem syllabus</div>
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
