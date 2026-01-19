import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../assets/css/pages/lecturer.css";

import { hasRole, getToken } from "../../../services/auth";
import { studentApi, type Course } from "../../../services/student";

type SortKey = "name_asc" | "name_desc";

/** format list relations -> "CS101 - ..., CS102 - ..." */
const fmtCourses = (list?: { code?: string; name?: string }[]) => {
    if (!list || list.length === 0) return "Không có";
    return list
        .map((x) => `${x.code ?? "N/A"} - ${x.name ?? ""}`.trim())
        .join(", ");
};

export default function StudentRegisterCoursePage() {
    const nav = useNavigate();

    // ===== data state =====
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    // ===== filter/search/sort state =====
    const [year, setYear] = useState<string>("ALL");
    const [semester, setSemester] = useState<string>("ALL");
    const [q, setQ] = useState("");
    const [sort, setSort] = useState<SortKey>("name_asc");

    const isStudent = hasRole("STUDENT") || hasRole("ROLE_STUDENT");

    // =====================================================
    // FETCH AVAILABLE COURSES (server-side filter by year/semester)
    // =====================================================
    const fetchCourses = async (y: string, s: string) => {
        setLoading(true);
        setErr(null);

        try {
            // ✅ chỉ gửi param khi khác ALL
            const params = {
                academicYear: y !== "ALL" ? y : undefined,
                semester: s !== "ALL" ? s : undefined,
            };

            const data = await studentApi.availableCourses(params);
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

    // =====================================================
    // AUTH CHECK + LOAD DATA
    // - load lần đầu và load lại khi đổi year/semester (đúng yêu cầu của bạn)
    // =====================================================
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

        fetchCourses(year, semester);
        // ✅ đổi year/semester -> gọi lại API để lấy danh sách “môn chưa đăng ký” đúng filter
    }, [isStudent, year, semester]);

    // =====================================================
    // REGISTER COURSE
    // =====================================================
    const handleRegister = async (courseId: number) => {
        if (!window.confirm("Bạn có chắc muốn đăng ký môn học này?")) return;
        try {
            await studentApi.subscribeCourse(courseId);
            alert("Đăng ký môn học thành công!");
            // reload theo filter hiện tại
            fetchCourses(year, semester);
        } catch (e: any) {
            alert(e?.response?.data?.message || e?.message || "Đăng ký thất bại");
        }
    };

    // =====================================================
    // OPTIONS FOR DROPDOWN (lấy từ data trả về)
    // =====================================================
    const yearOptions = useMemo(() => {
        const ys = Array.from(new Set(courses.map((c) => c.academicYear).filter(Boolean))) as string[];
        ys.sort();
        return ys;
    }, [courses]);

    const semesterOptions = useMemo(() => {
        const ss = Array.from(
            new Set(
                courses
                    .filter((c) => year === "ALL" || c.academicYear === year)
                    .map((c) => c.semester)
                    .filter(Boolean)
            )
        ) as string[];

        ss.sort((a, b) => {
            const na = Number(a), nb = Number(b);
            const aIsNum = !Number.isNaN(na), bIsNum = !Number.isNaN(nb);
            if (aIsNum && bIsNum) return na - nb;
            if (aIsNum) return -1;
            if (bIsNum) return 1;
            return a.localeCompare(b);
        });

        return ss;
    }, [courses, year]);

    // ✅ đổi năm -> reset học kỳ về ALL để “học kỳ thuộc năm đó”
    useEffect(() => {
        setSemester("ALL");
    }, [year]);

    // =====================================================
    // FILTER + SORT VIEW (client-side: search + sort)
    // (year/semester đã lọc ở server; ở đây chỉ search/sort)
    // =====================================================
    const view = useMemo(() => {
        const key = q.trim().toLowerCase();

        let list = courses.filter((c) =>
            `${c.code || ""} ${c.name || ""} ${c.department || ""}`.toLowerCase().includes(key)
        );

        list.sort((a, b) => {
            const an = (a.name || a.code || "").toLowerCase();
            const bn = (b.name || b.code || "").toLowerCase();
            return sort === "name_asc" ? an.localeCompare(bn) : bn.localeCompare(an);
        });

        return list;
    }, [courses, q, sort]);

    // =====================================================
    // UI
    // =====================================================
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

                        {/* FILTER YEAR */}
                        <select className="lec-select" value={year} onChange={(e) => setYear(e.target.value)}>
                            <option value="ALL">Tất cả năm học</option>
                            {yearOptions.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>

                        {/* FILTER SEMESTER (theo năm đã chọn) */}
                        <select
                            className="lec-select"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            disabled={year !== "ALL" && semesterOptions.length === 0}
                        >
                            <option value="ALL">Tất cả học kỳ</option>
                            {semesterOptions.map((s) => (
                                <option key={s} value={s}>
                                    HK {s}
                                </option>
                            ))}
                        </select>

                        {/* SORT */}
                        <select className="lec-select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                            <option value="name_asc">A → Z</option>
                            <option value="name_desc">Z → A</option>
                        </select>

                        <button className="lec-select" onClick={() => nav("/student")}>
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
                                                {c.department || "Chưa có khoa"} · {c.academicYear ?? "-"} · HK {c.semester ?? "-"}
                                            </div>

                                            {/* ✅ Nếu backend trả quan hệ, sẽ hiện ở đây */}
                                            <div className="course-sub">
                                                <b>Tiên quyết:</b> {fmtCourses((c as any).prerequisites)}
                                            </div>
                                            <div className="course-sub">
                                                <b>Song hành:</b> {fmtCourses((c as any).parallelCourses)}
                                            </div>
                                            <div className="course-sub">
                                                <b>Bổ trợ:</b> {fmtCourses((c as any).supplementaryCourses)}
                                            </div>
                                        </div>

                                        <button className="lec-select" onClick={() => handleRegister(c.id)}>
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
