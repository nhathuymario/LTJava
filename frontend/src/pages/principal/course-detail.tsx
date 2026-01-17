import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../../assets/css/pages/hod.css";

import { hasRole, getToken } from "../../services/auth";
import { principalApi } from "../../services/principal";
import type { Syllabus } from "../../services/syllabus";

export default function PrincipalCourseDetailPage() {
    const nav = useNavigate();
    const { courseId } = useParams();
    const id = Number(courseId);

    const loc = useLocation() as any;
    const initialCourse = loc.state?.course;

    // NOTE: initialSyllabi từ list principal thường chỉ AA_APPROVED
    const initialSyllabi: Syllabus[] = loc.state?.syllabi || [];

    const [syllabi, setSyllabi] = useState<Syllabus[]>(initialSyllabi);
    const [loading, setLoading] = useState(initialSyllabi.length === 0);
    const [error, setError] = useState<string | null>(null);

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const isPrincipal = hasRole("PRINCIPAL");
    const toggleMenu = (sid: number) =>
        setOpenMenuId((p) => (p === sid ? null : sid));

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            // ✅ Principal cần thấy cả AA_APPROVED (để approve/reject)
            // ✅ và PRINCIPAL_APPROVED (để publish/reject)
            const [aa, pa] = await Promise.all([
                principalApi.listByStatus("AA_APPROVED"),
                principalApi.listByStatus("PRINCIPAL_APPROVED"),
                principalApi.listByStatus("PUBLISHED"),
            ]);

            const merged = [...(aa || []), ...(pa || [])]
                .filter((s: any) => Number(s?.course?.id) === id)
                .sort((a: any, b: any) => Number(b.id) - Number(a.id));

            setSyllabi(merged);
        } catch (err: any) {
            const resp = err?.response?.data;
            const msg =
                resp?.message || resp || err?.message || "Không tải được syllabus cho course";
            setError(typeof msg === "string" ? msg : "Không tải được dữ liệu");
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
        if (!isPrincipal) {
            setError("Bạn không có quyền truy cập (PRINCIPAL).");
            setLoading(false);
            return;
        }
        if (!id) {
            setError("courseId không hợp lệ.");
            setLoading(false);
            return;
        }

        // Refresh trang -> phải fetch lại từ server
        // Còn nếu đã có initialSyllabi thì vẫn nên fetch để lấy PRINCIPAL_APPROVED trong course
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isPrincipal]);

    const approve = async (sid: number) => {
        if (!window.confirm("Principal duyệt syllabus này?")) return;
        try {
            await principalApi.approve(sid);

            // ✅ update local: AA_APPROVED -> PRINCIPAL_APPROVED
            setSyllabi((prev) =>
                prev.map((s: any) =>
                    s.id === sid ? { ...s, status: "PRINCIPAL_APPROVED" } : s
                )
            );

            setOpenMenuId(null);
        } catch (err: any) {
            alert(err?.response?.data?.message || "Approve thất bại");
        }
    };

    const publish = async (sid: number) => {
        if (!window.confirm("Public syllabus này?")) return;
        try {
            await principalApi.publish(sid);

            // ✅ update local: PRINCIPAL_APPROVED -> PUBLISHED
            setSyllabi((prev) =>
                prev.map((s: any) =>
                    s.id === sid ? { ...s, status: "PUBLISHED" } : s
                )
            );

            setOpenMenuId(null);
        } catch (err: any) {
            alert(err?.response?.data?.message || "Publish thất bại");
        }
    };

    const reject = async (sid: number) => {
        const note = window.prompt("Lý do từ chối (có thể bỏ trống):") || "";
        if (!window.confirm("Từ chối syllabus này?")) return;

        try {
            await principalApi.reject(sid, note.trim());

            setSyllabi((prev) =>
                prev.map((s: any) =>
                    s.id === sid
                        ? { ...s, status: "REJECTED", editNote: note.trim() }
                        : s
                )
            );

            setOpenMenuId(null);
        } catch (err: any) {
            alert(err?.response?.data?.message || "Reject thất bại");
        }
    };

    const courseTitle = initialCourse
        ? `[${initialCourse.code || "NO_CODE"}] - ${initialCourse.name || `Course #${id}`}`
        : `Course #${id}`;

    const emptyText = useMemo(() => {
        return "Course này không có syllabus cần xử lý (AA_APPROVED / PRINCIPAL_APPROVED).";
    }, []);

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button className="lec-link" onClick={() => nav("/principal")}>
                        ← Quay lại
                    </button>

                    <div className="course-detail-header">
                        <div className="course-detail-title">{courseTitle}</div>
                        <div className="course-detail-desc">
                            Principal xử lý syllabus <b>AA_APPROVED</b> (Approve/Reject) và{" "}
                            <b>PRINCIPAL_APPROVED</b> (Publish/Reject)
                        </div>
                    </div>

                    {loading && <div className="lec-empty">Đang tải...</div>}
                    {error && <div className="lec-empty">❌ {error}</div>}

                    {!loading && !error && (
                        <div className="syllabus-folder-list">
                            {syllabi.length === 0 ? (
                                <div className="lec-empty">{emptyText}</div>
                            ) : (
                                syllabi.map((s: any) => (
                                    <div key={s.id} className="syllabus-folder">
                                        <div className="syllabus-left">
                                            <div className="syllabus-folder-icon">📁</div>
                                            <div className="syllabus-folder-name">
                                                {s.title}
                                                <span
                                                    className={`syllabus-status status-${String(
                                                        s.status || ""
                                                    ).toLowerCase()}`}
                                                >
                          {s.status}
                        </span>
                                            </div>
                                        </div>

                                        <div className="syllabus-actions">
                                            <button
                                                className="syllabus-more"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleMenu(s.id);
                                                }}
                                            >
                                                ⋮
                                            </button>

                                            {openMenuId === s.id && (
                                                <div className="syllabus-menu">
                                                    {s.status === "AA_APPROVED" ? (
                                                        <>
                                                            <button
                                                                className="syllabus-menu-item"
                                                                onClick={() => approve(s.id)}
                                                            >
                                                                ✅ Approve
                                                            </button>
                                                            <button
                                                                className="syllabus-menu-item"
                                                                onClick={() => reject(s.id)}
                                                            >
                                                                ❌ Reject
                                                            </button>
                                                        </>
                                                    ) : s.status === "PRINCIPAL_APPROVED" ? (
                                                        <>
                                                            <button
                                                                className="syllabus-menu-item"
                                                                onClick={() => publish(s.id)}
                                                            >
                                                                🌍 Publish
                                                            </button>
                                                            <button
                                                                className="syllabus-menu-item"
                                                                onClick={() => reject(s.id)}
                                                            >
                                                                ❌ Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            className="syllabus-menu-item"
                                                            onClick={() => setOpenMenuId(null)}
                                                        >
                                                            Đóng
                                                        </button>
                                                    )}
                                                </div>
                                            )}
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
