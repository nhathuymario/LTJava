// trang sũa của syllabus
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../../../assets/css/pages/lecturer.css";

import { hasRole, getToken } from "../../../services/auth";
import { lecturerApi } from "../../../services/lecturer";
import type { CreateSyllabusRequest, Syllabus } from "../../../services/syllabus";
import CourseOutcomesForm, { type CourseOutcomes } from "./CourseOutcomesForm";

type NavState = { courseId?: number };

export default function LecturerSyllabusEditPage() {
    const nav = useNavigate();
    const { syllabusId } = useParams();
    const id = Number(syllabusId);

    const loc = useLocation() as { state?: NavState };
    const courseIdFromState = loc.state?.courseId;

    const isLecturer = hasRole("LECTURER");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string>("");

    const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
    const [form, setForm] = useState<CreateSyllabusRequest>({
        courseId: courseIdFromState || 0,
        title: "",
        description: "",
        academicYear: "",
        semester: "",
    });

    const [courseOutcomes, setCourseOutcomes] = useState<CourseOutcomes>({
        generalInfo: {
            nameVi: "",
            nameEn: "",
            codeId: "",
            credits: "",
            theory: "",
            practice: "",
            project: "",
            total: "",
            selfStudy: "",
            prerequisiteId: "",
            corequisiteId: "",
            parallerId: "",
            courseType: "Bắt buộc",
            component: "",
        },
        description: "",
        courseObjectives: [],
        courseLearningOutcomes: [],
        cloMappings: [],
        studentDuties: "",
        assessmentMethods: [],
        teachingPlan: [],
    });

    const canEdit = useMemo(() => syllabus?.status === "DRAFT", [syllabus]);

    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) {
            setError("Bạn chưa đăng nhập (thiếu token).");
            setLoading(false);
            return;
        }
        if (!isLecturer) {
            setError("Bạn không có quyền truy cập (LECTURER).");
            setLoading(false);
            return;
        }
        if (!id) {
            setError("syllabusId không hợp lệ.");
            setLoading(false);
            return;
        }

        (async () => {
            setLoading(true);
            setError("");
            try {
                const s: Syllabus = await lecturerApi.getById(id);

                setSyllabus(s);
                setForm({
                    courseId: Number(s.course?.id || courseIdFromState || 0),
                    title: s.title || "",
                    description: s.description || "",
                    academicYear: s.academicYear || "",
                    semester: s.semester || "",
                });
            } catch (err: any) {
                const resp = err?.response?.data;
                const msg =
                    resp?.message || resp || err?.message || "Không tải được syllabus";
                setError(typeof msg === "string" ? msg : "Không tải được dữ liệu");
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isLecturer]);

    const onChange = (key: keyof CreateSyllabusRequest, value: string | number) => {
        setForm((prev) => ({ ...prev, [key]: value as any }));
    };

    const onSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!canEdit) {
            setError("Chỉ syllabus ở trạng thái DRAFT mới được chỉnh sửa.");
            return;
        }
        if (!form.title.trim()) {
            setError("Title không được để trống.");
            return;
        }

        try {
            setSaving(true);
            const updated = await lecturerApi.updateSyllabus(id, {
                ...form,
                title: form.title.trim(),
                description: form.description?.trim() || undefined,
                academicYear: form.academicYear?.trim() || undefined,
                semester: form.semester?.trim() || undefined,
            });
            setSyllabus(updated);
            nav(`/lecturer/courses/${updated.course?.id || form.courseId}`);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Lưu thất bại");
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async () => {
        if (!syllabus) return;

        if (syllabus.status !== "DRAFT") {
            setError("Chỉ syllabus ở trạng thái DRAFT mới được xóa.");
            return;
        }

        if (!window.confirm("Xóa syllabus này? (không thể hoàn tác)")) return;

        try {
            setDeleting(true);
            await lecturerApi.deleteSyllabus(id);
            nav(`/lecturer/courses/${syllabus.course?.id || form.courseId}`);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Xóa thất bại");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button
                        className="lec-link"
                        onClick={() =>
                            nav(
                                syllabus?.course?.id
                                    ? `/lecturer/courses/${syllabus.course.id}`
                                    : "/lecturer"
                            )
                        }
                    >
                        ← Quay lại
                    </button>

                    <div className="course-detail-header">
                        <div className="course-detail-title">Sửa Syllabus</div>
                        <div className="course-detail-desc">
                            Trạng thái:{" "}
                            <b className={`syllabus-status status-${String(syllabus?.status || "").toLowerCase()}`}>
                                {syllabus?.status || "-"}
                            </b>
                            {typeof syllabus?.version === "number" ? (
                                <span style={{ marginLeft: 10, opacity: 0.8 }}>
                  Version: v{syllabus.version}
                </span>
                            ) : null}   
                        </div>
                    </div>

                    {loading && <div className="lec-empty">Đang tải...</div>}
                    {error && <div className="lec-empty">❌ {error}</div>}

                    {!loading && !error && (
                        <form onSubmit={onSave} style={{ marginTop: 12 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>
                                        Course ID <span style={{ color: "#c00" }}>*</span>
                                    </label>
                                    <input
                                        style={inputStyle}
                                        type="number"
                                        value={form.courseId || ""}
                                        disabled
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Học Kỳ</label>
                                    <input
                                        style={inputStyle}
                                        value={form.semester || ""}
                                        disabled={!canEdit}
                                        onChange={(e) => onChange("semester", e.target.value)}
                                        placeholder="VD: HK1 / HK2 / Fall..."
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>
                                        Tiêu đề <span style={{ color: "#c00" }}>*</span>
                                    </label>
                                    <input
                                        style={inputStyle}
                                        value={form.title}
                                        disabled={!canEdit}
                                        onChange={(e) => onChange("title", e.target.value)}
                                        placeholder="Tên syllabus"
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Năm học</label>
                                    <input
                                        style={inputStyle}
                                        value={form.academicYear || ""}
                                        disabled={!canEdit}
                                        onChange={(e) => onChange("academicYear", e.target.value)}
                                        placeholder="VD: 2025-2026"
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: 12 }}>
                                <label style={labelStyle}>Mô tả</label>
                                <textarea
                                    style={{ ...inputStyle, minHeight: 140, resize: "vertical" }}
                                    value={form.description || ""}
                                    disabled={!canEdit}
                                    onChange={(e) => onChange("description", e.target.value)}
                                    placeholder="Mô tả syllabus"
                                />
                            </div>

                            {/* SCROLLABLE COURSE OUTCOMES FRAME */}
                            <div style={{ marginTop: 20 }}>
                                <label style={labelStyle}>Nội dung đề cương chi tiết</label>
                                <CourseOutcomesForm 
                                    courseOutcomes={courseOutcomes} 
                                    setCourseOutcomes={setCourseOutcomes}
                                    canEdit={canEdit}
                                />
                            </div>

                            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                                <button
                                    type="submit"
                                    disabled={!canEdit || saving}
                                    className="lec-btn"
                                >
                                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>

                                <button
                                    type="button"
                                    className="lec-btn-outline"
                                    onClick={() =>
                                        nav(
                                            syllabus?.course?.id
                                                ? `/lecturer/courses/${syllabus.course.id}`
                                                : "/lecturer"
                                        )
                                    }
                                >
                                    Hủy
                                </button>

                                <button
                                    type="button"
                                    disabled={!canEdit || deleting}
                                    onClick={onDelete}
                                    className="lec-btn-outline"
                                    style={{ marginLeft: "auto", backgroundColor: "#f3b5b5", color: "#b00020", border: "none" }}
                                >
                                    {deleting ? "Đang xóa..." : "Xóa"}
                                </button>
                            </div>

                            {!canEdit && (
                                <div style={{ marginTop: 10, fontSize: 13, opacity: 0.8 }}>
                                    Chỉ syllabus ở trạng thái <b>DRAFT</b> mới được chỉnh sửa/xóa.
                                    Nếu syllabus bị yêu cầu sửa (REQUESTEDIT/REJECTED), hãy bấm{" "}
                                    <b>Move to draft</b> ở trang course trước.
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: "block",
    fontWeight: 600,
    marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    outline: "none",
};
