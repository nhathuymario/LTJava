
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../assets/css/pages/aa/aa-edit-course.css";

import { hasRole } from "../../../services/auth";
import { getCourseById, updateCourse } from "../../../services/course";

type FormState = {
    code: string;
    name: string;
    credits: string; // keep string for input
    department: string;
    lecturerUsername: string;
    academicYear: string;
    semester: string;
};

export default function AaEditCoursePage() {
    const nav = useNavigate();
    const { id } = useParams();

    const courseId = useMemo(() => Number(id), [id]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [form, setForm] = useState<FormState>({
        code: "",
        name: "",
        credits: "",
        department: "",
        lecturerUsername: "",
        academicYear: "",
        semester: "",
    });

    const isAA = hasRole("AA") || hasRole("ROLE_AA");

    useEffect(() => {
        if (!isAA) {
            setErr("Bạn không có quyền (AA).");
            setLoading(false);
            return;
        }
        if (!courseId || Number.isNaN(courseId)) {
            setErr("ID course không hợp lệ.");
            setLoading(false);
            return;
        }

        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const c = await getCourseById(courseId);

                setForm({
                    code: c.code ?? "",
                    name: c.name ?? "",
                    credits: c.credits != null ? String(c.credits) : "",
                    department: c.department ?? "",
                    lecturerUsername: c.lecturerUsername ?? "",
                    academicYear: c.academicYear ?? "",
                    semester: c.semester ?? "",
                });
            } catch (e: any) {
                setErr(e?.response?.data?.message || e?.message || "Không tải được course");
            } finally {
                setLoading(false);
            }
        })();
    }, [isAA, courseId]);

    const setField = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((p) => ({ ...p, [k]: e.target.value }));
    };

    const validate = () => {
        const code = form.code.trim();
        const name = form.name.trim();
        const creditsNum = Number(form.credits);

        if (!code) return "Course code không được trống";
        if (!name) return "Course name không được trống";
        if (Number.isNaN(creditsNum) || creditsNum <= 0) return "Credits không hợp lệ";

        return null;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const v = validate();
        if (v) {
            setErr(v);
            return;
        }

        setSaving(true);
        setErr(null);
        try {
            await updateCourse(courseId, {
                code: form.code.trim(),
                name: form.name.trim(),
                credits: Number(form.credits),
                department: form.department.trim(),
                lecturerUsername: form.lecturerUsername.trim(),
                academicYear: form.academicYear.trim() || undefined,
                semester: form.semester.trim() || undefined,
            });

            nav("/aa/courses");
        } catch (e2: any) {
            setErr(e2?.response?.data?.message || e2?.message || "Cập nhật thất bại");
        } finally {
            setSaving(false);
        }
    };
    return (
        <div className="lec-page">
            <div className="lec-container">
                <h1 className="lec-title">AA • Sửa môn học</h1>

                <div className="lec-card">
                    <div className="manage-toolbar" style={{ gap: 8 }}>
                        <button className="lec-btn" onClick={() => nav("/aa/courses-manager")}>
                            ← Quay lại
                        </button>
                    </div>

                    {loading ? (
                        <div className="lec-empty">Đang tải.</div>
                    ) : (
                        <form className="aa-edit-form" onSubmit={onSubmit}>
                            {err && <div className="aa-edit-error">❌ {err}</div>}

                            <div className="aa-edit-grid">
                                <div>
                                    <label className="aa-edit-label">Course code</label>
                                    <input
                                        className="aa-edit-input"
                                        value={form.code}
                                        onChange={setField("code")}
                                    />
                                </div>

                                <div>
                                    <label className="aa-edit-label">Credits</label>
                                    <input
                                        className="aa-edit-input"
                                        value={form.credits}
                                        onChange={setField("credits")}
                                    />
                                </div>

                                <div className="full">
                                    <label className="aa-edit-label">Course name</label>
                                    <input
                                        className="aa-edit-input"
                                        value={form.name}
                                        onChange={setField("name")}
                                    />
                                </div>

                                <div>
                                    <label className="aa-edit-label">Department</label>
                                    <input
                                        className="aa-edit-input"
                                        value={form.department}
                                        onChange={setField("department")}
                                    />
                                </div>

                                <div>
                                    <label className="aa-edit-label">Lecturer username</label>
                                    <input
                                        className="aa-edit-input"
                                        value={form.lecturerUsername}
                                        onChange={setField("lecturerUsername")}
                                    />
                                </div>

                                <div>
                                    <label className="aa-edit-label">Academic year</label>
                                    <input
                                        className="aa-edit-input"
                                        value={form.academicYear}
                                        onChange={setField("academicYear")}
                                        placeholder="vd: 2025-2026"
                                    />
                                </div>

                                <div>
                                    <label className="aa-edit-label">Semester</label>
                                    <input
                                        className="aa-edit-input"
                                        value={form.semester}
                                        onChange={setField("semester")}
                                        placeholder="vd: 1 / 2"
                                    />
                                </div>
                            </div>

                            <div className="aa-edit-actions">
                                <button
                                    type="button"
                                    className="aa-btn aa-btn-cancel"
                                    onClick={() => nav("/aa/courses-manager")}
                                    disabled={saving}
                                >
                                    Hủy
                                </button>

                                <button className="aa-btn aa-btn-save" disabled={saving}>
                                    {saving ? "Đang lưu..." : "Lưu"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );

}
