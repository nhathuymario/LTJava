import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/pages/lecturer.css";

import PaginationBar from "../../components/common/PaginationBar"

import { hasRole, getToken } from "../../services/auth";
import { getMyCourses, type Course } from "../../services/course";

type SortKey = "name_asc" | "name_desc";
type MenuOpen = number | null;

export default function LecturerPage() {
    const nav = useNavigate();

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [sort, setSort] = useState<SortKey>("name_asc");
    const [menuOpen, setMenuOpen] = useState<MenuOpen>(null);

    const isLecturer = hasRole("LECTURER");

    const fetchCourses = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMyCourses();
            setCourses(data);
        } catch (err: any) {
            const status = err?.response?.status;
            const resp = err?.response?.data;

            if (status === 401 || status === 403) {
                setError("Phiên đăng nhập hết hạn hoặc bạn không có quyền LECTURER.");
            } else {
                const msg = resp?.message || resp || err?.message || "Không tải được danh sách khóa học";
                setError(typeof msg === "string" ? msg : "Không tải được danh sách khóa học");
            }
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
            setError("Bạn không có quyền truy cập trang này (LECTURER).");
            setLoading(false);
            return;
        }
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLecturer]);

    const filtered = useMemo(() => {
        const norm = (s: string) => s.toLowerCase().trim();
        const hay = (c: Course) => `${c.code} ${c.name} ${c.department || ""}`.toLowerCase();

        let list = courses.filter((c) => hay(c).includes(norm(q)));

        list.sort((a, b) => {
            const an = (a.name || "").toLowerCase();
            const bn = (b.name || "").toLowerCase();
            return sort === "name_asc" ? an.localeCompare(bn) : bn.localeCompare(an);
        });

        return list;
    }, [courses, q, sort]);

    const PAGE_SIZE = 10
    const [page, setPage] = useState(1)

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

    useEffect(() => {
        if (page > totalPages) setPage(totalPages)
    }, [page, totalPages])

    useEffect(() => {
        setPage(1) // reset khi search/sort đổi
    }, [q, sort])

    const paged = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE
        return filtered.slice(start, start + PAGE_SIZE)
    }, [filtered, page])


    return (
        <div className="lec-page">
            <div className="lec-container">
                <h1 className="lec-title">Khóa học của tôi</h1>

                <div className="lec-card">
                    <h2 className="lec-section-title">Tổng quan về khóa học</h2>

                    <div className="lec-toolbar">
                        <select className="lec-select" defaultValue="all" disabled>
                            <option value="all">All</option>
                        </select>

                        <input
                            className="lec-search"
                            placeholder="Tìm kiếm"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />

                        <select
                            className="lec-select"
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortKey)}
                        >
                            <option value="name_asc">Sort by course name</option>
                            <option value="name_desc">Sort Z → A</option>
                        </select>
                    </div>

                    {error && <div className="lec-empty">❌ {error}</div>}
                    {loading && <div className="lec-empty">Đang tải...</div>}

                    {!loading && !error && (
                        <div className="lec-list">
                            {filtered.length === 0 ? (
                                <div className="lec-empty">Không có course nào.</div>
                            ) : (
                                paged.map((c, idx) => (
                                    <div
                                        key={c.id}
                                        className="course-row"
                                        onClick={() => nav(`/lecturer/courses/${c.id}`)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className={`course-thumb thumb-${idx % 4}`} />

                                        <div className="course-info">
                                            <div className="course-name">
                                                [{c.code}] - {c.name}
                                            </div>
                                            <div className="course-sub">
                                                {c.department ? `[CQ]_${c.department}` : "Chưa có khoa/department"}
                                            </div>
                                        </div>

                                        <div style={{ position: "relative" }}>
                                            <button 
                                                className="course-more" 
                                                title="More" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setMenuOpen(menuOpen === idx ? null : idx);
                                                }}
                                            >
                                                ⋮
                                            </button>
                                            {menuOpen === idx && (
                                                <div className="syllabus-menu">
                                                    <button
                                                        className="syllabus-menu-item"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            nav(`/lecturer/courses/${c.id}`);
                                                            setMenuOpen(null);
                                                        }}
                                                    >
                                                        Xem chi tiết
                                                    </button>
                                                    <button
                                                        className="syllabus-menu-item"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            nav(`/lecturer/clo-plo/${c.id}`);
                                                            setMenuOpen(null);
                                                        }}
                                                    >
                                                        Ánh xạ CLO-PLO
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
                                totalItems={filtered.length}
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
