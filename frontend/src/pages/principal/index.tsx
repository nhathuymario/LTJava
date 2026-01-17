import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // ✅ thêm useSearchParams
import "../../assets/css/pages/hod.css";

import { hasRole, getToken } from "../../services/auth";
import { principalApi } from "../../services/principal";
import type { Syllabus } from "../../services/syllabus";

type SortKey = "name_asc" | "name_desc";
type ViewStatus = "AA_APPROVED" | "PRINCIPAL_APPROVED" | "PUBLISHED";

type CourseGroup = {
    courseId: number;
    code?: string;
    name?: string;
    department?: string;
    count: number;
    syllabi: Syllabus[];
};

export default function PrincipalPage() {
    const nav = useNavigate();

    // ✅ Đọc/ghi query param: /principal?status=AA_APPROVED|PRINCIPAL_APPROVED|PUBLISHED
    const [searchParams, setSearchParams] = useSearchParams();

    // ✅ Lấy status từ URL (nếu không có thì mặc định AA_APPROVED)
    const urlStatus = (searchParams.get("status") || "AA_APPROVED") as ViewStatus;

    // ✅ Local state dùng để render (sẽ sync theo urlStatus)
    const [viewStatus, setViewStatus] = useState<ViewStatus>(urlStatus);

    const [items, setItems] = useState<Syllabus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [sort, setSort] = useState<SortKey>("name_asc");

    const isPrincipal = hasRole("PRINCIPAL");

    // ✅ Mỗi khi urlStatus đổi (do user đổi select hoặc back/forward), đồng bộ lại viewStatus
    useEffect(() => {
        setViewStatus(urlStatus);
    }, [urlStatus]);

    // ✅ Fetch data theo urlStatus (nguồn chân lý là URL)
    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) {
            setError("Bạn chưa đăng nhập (thiếu token).");
            setLoading(false);
            return;
        }
        if (!isPrincipal) {
            setError("Bạn không có quyền truy cập trang này (PRINCIPAL).");
            setLoading(false);
            return;
        }

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await principalApi.listByStatus(urlStatus);
                setItems((data || []) as Syllabus[]);
            } catch (err: any) {
                const status = err?.response?.status;
                const resp = err?.response?.data;
                if (status === 401 || status === 403) {
                    setError("Phiên đăng nhập hết hạn hoặc bạn không có quyền PRINCIPAL.");
                } else {
                    const msg =
                        resp?.message ||
                        resp ||
                        err?.message ||
                        `Không tải được danh sách syllabus ${urlStatus}`;
                    setError(typeof msg === "string" ? msg : "Không tải được dữ liệu");
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [isPrincipal, urlStatus]);

    // ✅ Group syllabus theo course để hiển thị list course
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

        // ✅ Search
        const key = q.toLowerCase().trim();
        if (key) {
            list = list.filter((x) =>
                `${x.code || ""} ${x.name || ""} ${x.department || ""}`
                    .toLowerCase()
                    .includes(key)
            );
        }

        // ✅ Sort
        list.sort((a, b) => {
            const an = (a.name || "").toLowerCase();
            const bn = (b.name || "").toLowerCase();
            return sort === "name_asc" ? an.localeCompare(bn) : bn.localeCompare(an);
        });

        return list;
    }, [items, q, sort]);

    // ✅ Title/empty text theo tab đang chọn
    const title =
        viewStatus === "AA_APPROVED"
            ? "Các course đang chờ duyệt (AA_APPROVED)"
            : viewStatus === "PRINCIPAL_APPROVED"
                ? "Các course đã duyệt, chờ public (PRINCIPAL_APPROVED)"
                : "Các course đã public (PUBLISHED)";

    const emptyText =
        viewStatus === "AA_APPROVED"
            ? "Không có course nào đang chờ duyệt."
            : viewStatus === "PRINCIPAL_APPROVED"
                ? "Không có course nào chờ public."
                : "Chưa có course nào có syllabus đã public.";

    return (
        <div className="lec-page">
            <div className="lec-container">
                <h1 className="lec-title">Principal • Duyệt syllabus</h1>

                <div className="lec-card">
                    <h2 className="lec-section-title">{title}</h2>

                    <div className="lec-toolbar">
                        {/* ✅ Select đổi tab: ghi vào URL để khi quay lại vẫn giữ đúng tab */}
                        <select
                            className="lec-select"
                            value={viewStatus}
                            onChange={(e) => {
                                const next = e.target.value as ViewStatus;
                                setSearchParams({ status: next }); // ✅ URL là nguồn chân lý
                            }}
                        >
                            <option value="AA_APPROVED">AA_APPROVED</option>
                            <option value="PRINCIPAL_APPROVED">PRINCIPAL_APPROVED</option>
                            <option value="PUBLISHED">PUBLISHED</option>
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
                                <div className="lec-empty">{emptyText}</div>
                            ) : (
                                courses.map((c, idx) => (
                                    <div
                                        key={c.courseId}
                                        className="course-row"
                                        onClick={() =>
                                            nav(`/principal/courses/${c.courseId}`, {
                                                // ✅ truyền viewStatus để trang detail biết quay về tab nào
                                                state: { course: c, syllabi: c.syllabi, viewStatus },
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
