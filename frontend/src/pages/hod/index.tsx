import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../lecturer/lecturer.css"; // dùng chung CSS hiện tại (đổi lại nếu bạn thật sự có hod.css)

import { hasRole, getToken } from "../../services/auth";
import { hodListSyllabusByStatus, type Syllabus } from "../../services/hod";

type SortKey = "name_asc" | "name_desc";

type CourseGroup = {
    courseId: number;
    code?: string;
    name?: string;
    department?: string;
    count: number;
    syllabi: Syllabus[];
};

export default function HodPage() {
    const nav = useNavigate();

    const [items, setItems] = useState<Syllabus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [sort, setSort] = useState<SortKey>("name_asc");

    const isHod = hasRole("HOD");

    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) {
            setError("Bạn chưa đăng nhập (thiếu token).");
            setLoading(false);
            return;
        }
        if (!isHod) {
            setError("Bạn không có quyền truy cập trang này (HOD).");
            setLoading(false);
            return;
        }

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await hodListSyllabusByStatus("SUBMITTED");
                setItems((data || []) as Syllabus[]);
            } catch (err: any) {
                const status = err?.response?.status;
                const resp = err?.response?.data;
                if (status === 401 || status === 403) {
                    setError("Phiên đăng nhập hết hạn hoặc bạn không có quyền HOD.");
                } else {
                    const msg = resp?.message || resp || err?.message || "Không tải được danh sách syllabus SUBMITTED";
                    setError(typeof msg === "string" ? msg : "Không tải được dữ liệu");
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [isHod]);

    // Group syllabus thành "course list"
    const courses = useMemo(() => {
        const map = new Map<number, CourseGroup>();

        for (const s of items) {
            const c: any = (s as any).course || {};
            const courseId = Number(c.id);
            if (!courseId) continue;

            const cur: CourseGroup =
                map.get(courseId) || {
                    courseId,
                    code: c.code,
                    name: c.name,
                    department: c.department,
                    count: 0,
                    syllabi: [] as Syllabus[], // ✅ fix never[]
                };

            cur.count += 1;
            cur.syllabi.push(s);

            // set lại info (phòng khi cái đầu thiếu)
            cur.code = cur.code || c.code;
            cur.name = cur.name || c.name;
            cur.department = cur.department || c.department;

            map.set(courseId, cur);
        }

        let list = Array.from(map.values());

        // search
        const norm = (x: string) => x.toLowerCase().trim();
        const key = norm(q);
        if (key) {
            list = list.filter((x) =>
                `${x.code || ""} ${x.name || ""} ${x.department || ""}`.toLowerCase().includes(key)
            );
        }

        // sort
        list.sort((a, b) => {
            const an = (a.name || "").toLowerCase();
            const bn = (b.name || "").toLowerCase();
            return sort === "name_asc" ? an.localeCompare(bn) : bn.localeCompare(an);
        });

        return list;
    }, [items, q, sort]);

    return (
        <div className="lec-page">
            <div className="lec-container">
                <h1 className="lec-title">HoD • Duyệt giáo trình</h1>

                <div className="lec-card">
                    <h2 className="lec-section-title">Các course đang chờ duyệt (SUBMITTED)</h2>

                    <div className="lec-toolbar">
                        <select className="lec-select" defaultValue="all" disabled>
                            <option value="all">SUBMITTED</option>
                        </select>

                        <input
                            className="lec-search"
                            placeholder="Tìm kiếm course"
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
                            {courses.length === 0 ? (
                                <div className="lec-empty">Không có course nào đang chờ duyệt.</div>
                            ) : (
                                courses.map((c, idx) => (
                                    <div
                                        key={c.courseId}
                                        className="course-row"
                                        onClick={() =>
                                            nav(`/hod/courses/${c.courseId}`, {
                                                state: { course: c, syllabi: c.syllabi },
                                            })
                                        }
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className={`course-thumb thumb-${idx % 4}`} />

                                        <div className="course-info">
                                            <div className="course-name">
                                                [{c.code || "NO_CODE"}] - {c.name || `Course #${c.courseId}`}
                                            </div>
                                            <div className="course-sub">
                                                {c.department ? `[CQ]_${c.department}` : "Chưa có khoa/department"} •{" "}
                                                {c.count} syllabus
                                            </div>
                                        </div>

                                        <button
                                            className="course-more"
                                            title="More"
                                            onClick={(e) => e.stopPropagation()}
                                        >
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
