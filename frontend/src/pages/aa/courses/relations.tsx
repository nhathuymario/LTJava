import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hasRole } from "../../../services/auth";
import "../../../assets/css/pages/aa/aa-course-relations.css";

import { getAllCourses, type Course } from "../../../services/course";
import { aaApi, type CourseRelationsResponse, type SetCourseRelationsBody } from "../../../services/aa";

export default function AaCourseRelationsPage() {
    const nav = useNavigate();
    const isAA = hasRole("AA") || hasRole("ROLE_AA");

    const [courses, setCourses] = useState<Course[]>([]);
    const [courseId, setCourseId] = useState<number | "">("");

    const [prereq, setPrereq] = useState<number[]>([]);
    const [parallel, setParallel] = useState<number[]>([]);
    const [supp, setSupp] = useState<number[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [toast, setToast] = useState<string>("");

    // ===== Load all courses =====
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getAllCourses();
                setCourses(data || []);
            } catch (e: any) {
                setError(e?.message || "Không tải được danh sách môn học");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const options = useMemo(
        () => (courses || []).map((c) => ({ id: c.id, label: `${c.code} - ${c.name}` })),
        [courses]
    );

    const available = useMemo(() => {
        if (courseId === "") return options;
        return options.filter((o) => o.id !== courseId);
    }, [options, courseId]);

    const toNumbers = (values: string[]) =>
        values.map((v) => Number(v)).filter((n) => !Number.isNaN(n));

    // ===== Load relations of selected course (prefill) =====
    const loadRelations = async (id: number) => {
        setError("");
        setToast("");
        try {
            const rel: CourseRelationsResponse = await aaApi.getCourseRelations(id);
            setPrereq(rel?.prerequisiteIds || []);
            setParallel(rel?.parallelIds || []);
            setSupp(rel?.supplementaryIds || []);
        } catch (e: any) {
            const msg = e?.response?.data?.message || e?.message || "Không tải được quan hệ môn học";
            setError(typeof msg === "string" ? msg : "Không tải được quan hệ môn học");
            setPrereq([]);
            setParallel([]);
            setSupp([]);
        }
    };

    // ===== Save (replace lists) =====
    const save = async () => {
        setError("");
        setToast("");

        if (courseId === "") {
            setError("Vui lòng chọn môn học chính.");
            return;
        }

        const body: SetCourseRelationsBody = {
            courseId: Number(courseId),
            prerequisiteIds: prereq,
            parallelIds: parallel,
            supplementaryIds: supp,
        };

        try {
            setSaving(true);
            await aaApi.setCourseRelations(body);
            setToast("✅ Đã lưu quan hệ môn học");
        } catch (e: any) {
            const msg = e?.response?.data?.message || e?.response?.data || e?.message;
            setError(typeof msg === "string" ? msg : "Lưu quan hệ học phần thất bại");
        } finally {
            setSaving(false);
        }
    };

    const clearAll = () => {
        setPrereq([]);
        setParallel([]);
        setSupp([]);
        setToast("🧹 Đã xóa lựa chọn (chưa lưu)");
    };

    if (!isAA) return <div style={{ padding: 16 }}>❌ Bạn không có quyền (AA)</div>;

    return (
        <div className="lec-page">
            <div className="lec-container">
                <h1 className="lec-title">AA • Set tiên quyết / song hành / bổ trợ</h1>

                <div className="lec-card">
                    <div className="aa-rel-page">
                        {loading && <div className="aa-rel-loading">Đang tải...</div>}
                        {error && <div className="aa-rel-error">{error}</div>}
                        {toast && <div className="aa-rel-success">{toast}</div>}

                        {!loading && (
                            <div className="aa-rel-form">
                                {/* COURSE */}
                                <div className="aa-rel-field">
                                    <span className="aa-rel-label">Môn học chính</span>
                                    <select
                                        className="aa-rel-select"
                                        value={courseId}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            const id = v ? Number(v) : "";
                                            setCourseId(id);

                                            // reset when empty
                                            if (id === "") {
                                                setPrereq([]);
                                                setParallel([]);
                                                setSupp([]);
                                                return;
                                            }

                                            // ✅ prefill relations
                                            loadRelations(id);
                                        }}
                                    >
                                        <option value="">-- Chọn môn học --</option>
                                        {options.map((o) => (
                                            <option key={o.id} value={o.id}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>

                                    {/* hint */}
                                    <div className="aa-rel-hint">
                                        Chọn môn học → hệ thống tự load quan hệ hiện tại để chỉnh/xóa.
                                    </div>
                                </div>

                                {/* PREREQ */}
                                <div className="aa-rel-field">
                                    <span className="aa-rel-label">Tiên quyết</span>
                                    <select
                                        className="aa-rel-select"
                                        multiple
                                        value={prereq.map(String)}
                                        onChange={(e) =>
                                            setPrereq(
                                                toNumbers(Array.from(e.target.selectedOptions).map((o) => o.value))
                                            )
                                        }
                                        disabled={courseId === "" || saving}
                                    >
                                        {available.map((o) => (
                                            <option key={o.id} value={o.id}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* PARALLEL */}
                                <div className="aa-rel-field">
                                    <span className="aa-rel-label">Song hành</span>
                                    <select
                                        className="aa-rel-select"
                                        multiple
                                        value={parallel.map(String)}
                                        onChange={(e) =>
                                            setParallel(
                                                toNumbers(Array.from(e.target.selectedOptions).map((o) => o.value))
                                            )
                                        }
                                        disabled={courseId === "" || saving}
                                    >
                                        {available.map((o) => (
                                            <option key={o.id} value={o.id}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* SUPP */}
                                <div className="aa-rel-field">
                                    <span className="aa-rel-label">Bổ trợ</span>
                                    <select
                                        className="aa-rel-select"
                                        multiple
                                        value={supp.map(String)}
                                        onChange={(e) =>
                                            setSupp(
                                                toNumbers(Array.from(e.target.selectedOptions).map((o) => o.value))
                                            )
                                        }
                                        disabled={courseId === "" || saving}
                                    >
                                        {available.map((o) => (
                                            <option key={o.id} value={o.id}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="aa-rel-actions">
                                    <button
                                        className="aa-rel-btn aa-rel-btn-cancel"
                                        type="button"
                                        onClick={() => nav("/aa")}
                                        disabled={saving}
                                    >
                                        ← Về AA
                                    </button>

                                    <button
                                        className="aa-rel-btn aa-rel-btn-cancel"
                                        type="button"
                                        onClick={clearAll}
                                        disabled={courseId === "" || saving}
                                    >
                                        🧹 Clear
                                    </button>

                                    <button
                                        className="aa-rel-btn aa-rel-btn-save"
                                        type="button"
                                        onClick={save}
                                        disabled={saving || courseId === ""}
                                    >
                                        {saving ? "Đang lưu..." : "Lưu"}
                                    </button>
                                </div>

                                {/* quick note */}
                                <div className="aa-rel-hint" style={{ marginTop: 10 }}>
                                    Tip: Bỏ chọn trong danh sách (Ctrl/Shift) rồi bấm <b>Lưu</b> để xóa quan hệ.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
