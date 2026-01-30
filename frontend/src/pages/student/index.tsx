import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/pages/student.css";
import { hasRole, getToken } from "../../services/auth";
import { studentApi, type Course } from "../../services/student";
import PaginationBar from "../../components/common/PaginationBar"


export default function StudentCoursesPage() {
    const nav = useNavigate();

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);


    const [courses, setCourses] = useState<Course[]>([]);
    // const [unread, setUnread] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [sort, setSort] = useState<"name_asc" | "name_desc">("name_asc");

    const isStudent = hasRole("STUDENT") || hasRole("ROLE_STUDENT");

    // =====================================================
    // LOAD COURSES + UNREAD COUNT (CHỈ SỐ)
    // =====================================================
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
                const [coursesRes] = await Promise.all([
                // const [coursesRes, unreadRes] = await Promise.all([
                    studentApi.myCourses(),
                    studentApi.unreadCount(), // ✅ CHỈ LẤY SỐ
                ]);

                setCourses(coursesRes || []);
                // setUnread(Number(unreadRes || 0));
            } catch (e: any) {
                setErr(e?.response?.data?.message || e?.message || "Không tải được dữ liệu");
            } finally {
                setLoading(false);
            }
        })();
    }, [isStudent]);

    // =====================================================
    // FILTER + SORT
    // =====================================================
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
    // =====================================================
    // Phân trang
    // =====================================================
    const PAGE_SIZE = 10
    const [page, setPage] = useState(1)

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(view.length / PAGE_SIZE)),
        [view.length]
    )

    useEffect(() => {
        if (page > totalPages) setPage(totalPages)
    }, [page, totalPages])

    useEffect(() => {
        setPage(1)
        // setMenuOpen(null) // nếu có menu
    }, [q, sort])

    const paged = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE
        return view.slice(start, start + PAGE_SIZE)
    }, [view, page])



    // =====================================================
    // UI
    // =====================================================
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

                {/*        /!* 🔔 CHỈ HIỂN THỊ SỐ *!/*/}
                {/*        <button*/}
                {/*            className="lec-select"*/}
                {/*            onClick={() => nav("/student/notifications")}*/}
                {/*        >*/}
                {/*            🔔 Notifications*/}
                {/*            {unread > 0 && (*/}
                {/*                <span*/}
                {/*                    style={{*/}
                {/*                        marginLeft: 6,*/}
                {/*                        background: "#ef4444",*/}
                {/*                        color: "#fff",*/}
                {/*                        borderRadius: 999,*/}
                {/*                        padding: "2px 8px",*/}
                {/*                        fontSize: 12,*/}
                {/*                        lineHeight: "14px",*/}
                {/*                        fontWeight: 700,*/}
                {/*                    }}*/}
                {/*                >*/}
                {/*  {unread}*/}
                {/*</span>*/}
                {/*            )}*/}
                {/*        </button>*/}
                    </div>

                    {loading && <div className="lec-empty">Đang tải...</div>}
                    {err && <div className="lec-empty">❌ {err}</div>}

                    {!loading && !err && (
                        <div className="lec-list">
                            {view.length === 0 ? (
                                <div className="lec-empty">Bạn chưa đăng ký môn nào.</div>
                            ) : (
                                paged.map((c, idx) => (
                                    <div
                                        key={c.id}
                                        className="course-row"
                                        style={{
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            position: "relative",
                                        }}
                                        onClick={() =>
                                            nav(`/student/courses/${c.id}`, { state: { course: c } })
                                        }
                                    >
                                        {/* LEFT */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div className={`course-thumb thumb-${idx % 4}`} />
                                            <div className="course-info">
                                                <div className="course-name">
                                                    [{c.code || "N/A"}] - {c.name || "Unnamed course"}
                                                </div>
                                                <div className="course-sub">Bấm để xem syllabus</div>
                                            </div>
                                        </div>

                                        {/* RIGHT ⋯ */}
                                        <div
                                            className="course-more"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                className="course-more-btn"
                                                onClick={() =>
                                                    setOpenMenuId(openMenuId === c.id ? null : c.id)
                                                }
                                                aria-label="More"
                                            >
                                                ⋮
                                            </button>

                                            {openMenuId === c.id && (
                                                <div className="course-more-menu">
                                                    <button
                                                        className="course-more-item danger"
                                                        onClick={async () => {
                                                            const ok = confirm(`Hủy đăng ký môn "${c.name}"?`);
                                                            if (!ok) return;

                                                            try {
                                                                await studentApi.unsubscribeCourse(c.id);
                                                                setCourses((prev) =>
                                                                    prev.filter((x) => x.id !== c.id)
                                                                );
                                                                setOpenMenuId(null);
                                                            } catch (e: any) {
                                                                alert("❌ Không thể hủy đăng ký");
                                                            }
                                                        }}
                                                    >
                                                        🚫 Hủy đăng ký
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                ))

                            )}
                            <PaginationBar
                                page={page}
                                totalPages={totalPages}
                                totalItems={view.length}
                                pageSize={PAGE_SIZE}
                                onPrev={() => setPage(p => Math.max(1, p - 1))}
                                onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                            />

                        </div>

                    )}
                </div>
            </div>
        </div>
    );
}
