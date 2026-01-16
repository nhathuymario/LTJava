import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/pages/aa.css";

import { hasRole, getToken } from "../../services/auth";
import { aaApi } from "../../services/aa";
import type { Syllabus, SyllabusStatus } from "../../services/syllabus";

type SortKey = "name_asc" | "name_desc";

type CourseGroup = {
    courseId: number;
    code?: string;
    name?: string;
    department?: string;
    count: number;
    syllabi: Syllabus[];
};

export default function AAPage() {
    const nav = useNavigate();

    const [items, setItems] = useState<Syllabus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [sort, setSort] = useState<SortKey>("name_asc");

    // AA chủ yếu xử lý HOD_APPROVED -> AA_APPROVED
    const [status, setStatus] = useState<SyllabusStatus>("HOD_APPROVED");

    const isAA = hasRole("AA");

    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) {
            setError("Bạn chưa đăng nhập (thiếu token).");
            setLoading(false);
            return;
        }
        if (!isAA) {
            setError("Bạn không có quyền truy cập trang này (AA).");
            setLoading(false);
            return;
        }

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await aaApi.listByStatus(status);
                setItems((data || []) as Syllabus[]);
            } catch (err: any) {
                const statusCode = err?.response?.status;
                const resp = err?.response?.data;
                if (statusCode === 401 || statusCode === 403) {
                    setError("Phiên đăng nhập hết hạn hoặc bạn không có quyền AA.");
                } else {
                    const msg = resp?.message || resp || err?.message || "Không tải được danh sách syllabus";
                    setError(typeof msg === "string" ? msg : "Không tải được dữ liệu");
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [isAA, status]);

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
                    syllabi: [] as Syllabus[],
                };

            cur.count += 1;
            cur.syllabi.push(s);

            cur.code = cur.code || c.code;
            cur.name = cur.name || c.name;
            cur.department = cur.department || c.department;

            map.set(courseId, cur);
        }

        let list = Array.from(map.values());

        const key = q.toLowerCase().trim();
        if (key) {
            list = list.filter((x) =>
                `${x.code || ""} ${x.name || ""} ${x.department || ""}`.toLowerCase().includes(key)
            );
        }

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
                <h1 className="lec-title">AA • Duyệt học thuật giáo trình</h1>

                <div className="lec-card">
                    <h2 className="lec-section-title">Danh sách course theo trạng thái syllabus</h2>

                    <div className="lec-toolbar">
                        <select
                            className="lec-select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as SyllabusStatus)}
                        >
                            <option value="HOD_APPROVED">HOD_APPROVED (chờ AA duyệt)</option>
                            <option value="AA_APPROVED">AA_APPROVED (đã duyệt • chờ Principal)</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="REQUESTEDIT">REQUESTEDIT</option>
                        </select>

                        <input
                            className="lec-search"
                            placeholder="Tìm kiếm course"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />

                        <select className="lec-select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                            <option value="name_asc">Sort by course name</option>
                            <option value="name_desc">Sort Z → A</option>
                        </select>
                    </div>

                    {error && <div className="lec-empty">❌ {error}</div>}
                    {loading && <div className="lec-empty">Đang tải...</div>}

                    {!loading && !error && (
                        <div className="lec-list">
                            {courses.length === 0 ? (
                                <div className="lec-empty">Không có course nào.</div>
                            ) : (
                                courses.map((c, idx) => (
                                    <div
                                        key={c.courseId}
                                        className="course-row"
                                        onClick={() =>
                                            nav(`/aa/courses/${c.courseId}`, {
                                                state: { course: c, syllabi: c.syllabi, status },
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
                                                {c.department ? `[CQ]_${c.department}` : "Chưa có khoa/department"} • {c.count} syllabus
                                            </div>
                                        </div>

                                        <button className="course-more" title="More" onClick={(e) => e.stopPropagation()}>
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
