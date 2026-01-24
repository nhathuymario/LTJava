// trang sũa của syllabus
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../../../assets/css/pages/lecturer.css";

import { hasRole, getToken } from "../../../services/auth";
import { lecturerApi } from "../../../services/lecturer";
import type { CreateSyllabusRequest, Syllabus } from "../../../services/syllabus";

type NavState = { courseId?: number };

interface CourseOutcomes {
  generalInfo: {
    nameVi: string;
    nameEn: string;
    codeId: string;
    credits: string;
    theory: string;
    practice: string;
    project: string;
    total: string;
    selfStudy: string;
    prerequisiteId: string;
    corequisiteId: string;
    parallerId: string;
    courseType: string;
    component: string;
  };
  description: string;
  courseObjectives: string[];
  courseLearningOutcomes: { code: string; description: string }[];
  cloMappings: { clo: string; plo: string; level: number }[];
  studentDuties: string;
  assessmentMethods: { component: string; method: string; clos: string; criteria: string; weight: string }[];
  teachingPlan: { week: string; chapter: string; content: string; clos: string; teaching: string; assessment: string }[];
}

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
                                    <label style={labelStyle}>Semester</label>
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
                                        Title <span style={{ color: "#c00" }}>*</span>
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
                                    <label style={labelStyle}>Academic Year</label>
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
                                <label style={labelStyle}>Description</label>
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
                                <div style={{
                                    maxHeight: "600px",
                                    overflowY: "auto",
                                    border: "1px solid #ddd",
                                    borderRadius: 10,
                                    padding: 16,
                                    backgroundColor: "#fafafa"
                                }}>

                                    {/* SECTION 1: GENERAL COURSE INFORMATION */}
                                    <div style={{ marginBottom: 24 }}>
                                        <h3 style={{ marginTop: 0, marginBottom: 12, color: "#333" }}>
                                            1. Tổng quát về học phần (General course information)
                                        </h3>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 13 }}>Tên tiếng Việt</label>
                                                <input
                                                    style={inputStyle}
                                                    disabled={!canEdit}
                                                    value={courseOutcomes.generalInfo.nameVi}
                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                        ...prev,
                                                        generalInfo: { ...prev.generalInfo, nameVi: e.target.value }
                                                    }))}
                                                    placeholder="Tên học phần tiếng Việt"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 13 }}>Tên tiếng Anh</label>
                                                <input
                                                    style={inputStyle}
                                                    disabled={!canEdit}
                                                    value={courseOutcomes.generalInfo.nameEn}
                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                        ...prev,
                                                        generalInfo: { ...prev.generalInfo, nameEn: e.target.value }
                                                    }))}
                                                    placeholder="Course name in English"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 13 }}>Mã HP</label>
                                                <input
                                                    style={inputStyle}
                                                    disabled={!canEdit}
                                                    value={courseOutcomes.generalInfo.codeId}
                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                        ...prev,
                                                        generalInfo: { ...prev.generalInfo, codeId: e.target.value }
                                                    }))}
                                                    placeholder="123015"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 13 }}>Số tín chỉ</label>
                                                <input
                                                    style={inputStyle}
                                                    disabled={!canEdit}
                                                    value={courseOutcomes.generalInfo.credits}
                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                        ...prev,
                                                        generalInfo: { ...prev.generalInfo, credits: e.target.value }
                                                    }))}
                                                    placeholder="3 (2,1,3)"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 13 }}>Lý thuyết/Bài tập</label>
                                                <input
                                                    style={inputStyle}
                                                    disabled={!canEdit}
                                                    value={courseOutcomes.generalInfo.theory}
                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                        ...prev,
                                                        generalInfo: { ...prev.generalInfo, theory: e.target.value }
                                                    }))}
                                                    placeholder="30"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 13 }}>Thực hành/Thí nghiệm</label>
                                                <input
                                                    style={inputStyle}
                                                    disabled={!canEdit}
                                                    value={courseOutcomes.generalInfo.practice}
                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                        ...prev,
                                                        generalInfo: { ...prev.generalInfo, practice: e.target.value }
                                                    }))}
                                                    placeholder="30"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 13 }}>Dự án/Thảo luận</label>
                                                <input
                                                    style={inputStyle}
                                                    disabled={!canEdit}
                                                    value={courseOutcomes.generalInfo.project}
                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                        ...prev,
                                                        generalInfo: { ...prev.generalInfo, project: e.target.value }
                                                    }))}
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 13 }}>Tổng (Lý thuyết + Thực hành)</label>
                                                <input
                                                    style={inputStyle}
                                                    disabled={!canEdit}
                                                    value={courseOutcomes.generalInfo.total}
                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                        ...prev,
                                                        generalInfo: { ...prev.generalInfo, total: e.target.value }
                                                    }))}
                                                    placeholder="60"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 13 }}>Tự học</label>
                                                <input
                                                    style={inputStyle}
                                                    disabled={!canEdit}
                                                    value={courseOutcomes.generalInfo.selfStudy}
                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                        ...prev,
                                                        generalInfo: { ...prev.generalInfo, selfStudy: e.target.value }
                                                    }))}
                                                    placeholder="90"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 13 }}>Mã HP tiên quyết</label>
                                                <input
                                                    style={inputStyle}
                                                    disabled={!canEdit}
                                                    value={courseOutcomes.generalInfo.prerequisiteId}
                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                        ...prev,
                                                        generalInfo: { ...prev.generalInfo, prerequisiteId: e.target.value }
                                                    }))}
                                                    placeholder="(nếu có)"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 13 }}>Mã HP song hành</label>
                                                <input
                                                    style={inputStyle}
                                                    disabled={!canEdit}
                                                    value={courseOutcomes.generalInfo.corequisiteId}
                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                        ...prev,
                                                        generalInfo: { ...prev.generalInfo, corequisiteId: e.target.value }
                                                    }))}
                                                    placeholder="(nếu có)"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 13 }}>Loại học phần</label>
                                                <select
                                                    style={inputStyle}
                                                    disabled={!canEdit}
                                                    value={courseOutcomes.generalInfo.courseType}
                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                        ...prev,
                                                        generalInfo: { ...prev.generalInfo, courseType: e.target.value }
                                                    }))}
                                                >
                                                    <option value="Bắt buộc">Bắt buộc</option>
                                                    <option value="Tự chọn bắt buộc">Tự chọn bắt buộc</option>
                                                    <option value="Tự chọn tự do">Tự chọn tự do</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 13 }}>Thuộc thành phần</label>
                                                <input
                                                    style={inputStyle}
                                                    disabled={!canEdit}
                                                    value={courseOutcomes.generalInfo.component}
                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                        ...prev,
                                                        generalInfo: { ...prev.generalInfo, component: e.target.value }
                                                    }))}
                                                    placeholder="Chuyên ngành"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 2: DESCRIPTION */}
                                    <div style={{ marginBottom: 24 }}>
                                        <h3 style={{ marginTop: 0, marginBottom: 12, color: "#333" }}>
                                            2. Mô tả tóm tắt học phần (Course description)
                                        </h3>
                                        <textarea
                                            style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
                                            disabled={!canEdit}
                                            value={courseOutcomes.description}
                                            onChange={(e) => setCourseOutcomes(prev => ({
                                                ...prev,
                                                description: e.target.value
                                            }))}
                                            placeholder="Mô tả chi tiết về nội dung, mục tiêu và phạm vi của học phần..."
                                        />
                                    </div>

                                    {/* SECTION 3: COURSE OBJECTIVES (COs) */}
                                    <div style={{ marginBottom: 24 }}>
                                        <h3 style={{ marginTop: 0, marginBottom: 12, color: "#333" }}>
                                            3. Mục tiêu học phần (Course Objectives)
                                        </h3>
                                        {courseOutcomes.courseObjectives.map((co, idx) => (
                                            <div key={idx} style={{ marginBottom: 12 }}>
                                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                    <label style={{ fontSize: 13, fontWeight: 600, minWidth: 60 }}>
                                                        CO{idx + 1}
                                                    </label>
                                                    <input
                                                        style={{ ...inputStyle, flex: 1 }}
                                                        disabled={!canEdit}
                                                        value={co}
                                                        onChange={(e) => setCourseOutcomes(prev => ({
                                                            ...prev,
                                                            courseObjectives: prev.courseObjectives.map((c, i) =>
                                                                i === idx ? e.target.value : c
                                                            )
                                                        }))}
                                                        placeholder={`Mô tả mục tiêu CO${idx + 1}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled={!canEdit}
                                                        onClick={() => setCourseOutcomes(prev => ({
                                                            ...prev,
                                                            courseObjectives: prev.courseObjectives.filter((_, i) => i !== idx)
                                                        }))}
                                                        style={{
                                                            padding: "8px 12px",
                                                            backgroundColor: "#f3b5b5",
                                                            color: "#b00020",
                                                            border: "none",
                                                            borderRadius: 6,
                                                            cursor: !canEdit ? "not-allowed" : "pointer",
                                                            opacity: !canEdit ? 0.5 : 1,
                                                        }}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            disabled={!canEdit}
                                            onClick={() => setCourseOutcomes(prev => ({
                                                ...prev,
                                                courseObjectives: [...prev.courseObjectives, ""]
                                            }))}
                                            style={{
                                                padding: "8px 12px",
                                                backgroundColor: "#e3f2fd",
                                                color: "#1976d2",
                                                border: "1px solid #1976d2",
                                                borderRadius: 6,
                                                cursor: !canEdit ? "not-allowed" : "pointer",
                                                opacity: !canEdit ? 0.5 : 1,
                                            }}
                                        >
                                            + Thêm CO
                                        </button>
                                    </div>

                                    {/* SECTION 4: COURSE LEARNING OUTCOMES (CLOs) */}
                                    <div style={{ marginBottom: 24 }}>
                                        <h3 style={{ marginTop: 0, marginBottom: 12, color: "#333" }}>
                                            4. Chuẩn đầu ra học phần (Course Learning Outcomes - CLOs)
                                        </h3>
                                        {courseOutcomes.courseLearningOutcomes.map((clo, idx) => (
                                            <div key={idx} style={{ marginBottom: 12 }}>
                                                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                                    <input
                                                        style={{ ...inputStyle, width: 100 }}
                                                        disabled={!canEdit}
                                                        value={clo.code}
                                                        onChange={(e) => setCourseOutcomes(prev => ({
                                                            ...prev,
                                                            courseLearningOutcomes: prev.courseLearningOutcomes.map((c, i) =>
                                                                i === idx ? { ...c, code: e.target.value } : c
                                                            )
                                                        }))}
                                                        placeholder="CLO1"
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled={!canEdit}
                                                        onClick={() => setCourseOutcomes(prev => ({
                                                            ...prev,
                                                            courseLearningOutcomes: prev.courseLearningOutcomes.filter((_, i) => i !== idx)
                                                        }))}
                                                        style={{
                                                            padding: "8px 12px",
                                                            backgroundColor: "#f3b5b5",
                                                            color: "#b00020",
                                                            border: "none",
                                                            borderRadius: 6,
                                                            cursor: !canEdit ? "not-allowed" : "pointer",
                                                            opacity: !canEdit ? 0.5 : 1,
                                                        }}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                                <textarea
                                                    style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                                                    disabled={!canEdit}
                                                    value={clo.description}
                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                        ...prev,
                                                        courseLearningOutcomes: prev.courseLearningOutcomes.map((c, i) =>
                                                            i === idx ? { ...c, description: e.target.value } : c
                                                        )
                                                    }))}
                                                    placeholder="Mô tả chi tiết CLO..."
                                                />
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            disabled={!canEdit}
                                            onClick={() => setCourseOutcomes(prev => ({
                                                ...prev,
                                                courseLearningOutcomes: [...prev.courseLearningOutcomes, { code: "", description: "" }]
                                            }))}
                                            style={{
                                                padding: "8px 12px",
                                                backgroundColor: "#e3f2fd",
                                                color: "#1976d2",
                                                border: "1px solid #1976d2",
                                                borderRadius: 6,
                                                cursor: !canEdit ? "not-allowed" : "pointer",
                                                opacity: !canEdit ? 0.5 : 1,
                                            }}
                                        >
                                            + Thêm CLO
                                        </button>
                                    </div>

                                    {/* SECTION 5: STUDENT DUTIES */}
                                    <div style={{ marginBottom: 24 }}>
                                        <h3 style={{ marginTop: 0, marginBottom: 12, color: "#333" }}>
                                            5. Nhiệm vụ của sinh viên (Students duties)
                                        </h3>
                                        <textarea
                                            style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
                                            disabled={!canEdit}
                                            value={courseOutcomes.studentDuties}
                                            onChange={(e) => setCourseOutcomes(prev => ({
                                                ...prev,
                                                studentDuties: e.target.value
                                            }))}
                                            placeholder="- Sinh viên phải tham dự tối thiểu 80% số tiết của học phần&#10;- Làm và nộp các bài tập/ báo cáo/ làm việc nhóm/ thuyết trình.... đúng thời gian quy định&#10;- Tự nghiên cứu các vấn đề được giao..."
                                        />
                                    </div>

                                    {/* SECTION 6: ASSESSMENT METHODS */}
                                    <div style={{ marginBottom: 24 }}>
                                        <h3 style={{ marginTop: 0, marginBottom: 12, color: "#333" }}>
                                            6. Phương pháp kiểm tra, đánh giá (Assessment methods)
                                        </h3>
                                        <div style={{ overflowX: "auto" }}>
                                            <table style={{
                                                width: "100%",
                                                borderCollapse: "collapse",
                                                marginBottom: 12,
                                                fontSize: 13
                                            }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: "#f0f0f0" }}>
                                                        <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Thành phần đánh giá</th>
                                                        <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Phương pháp / Hình thức</th>
                                                        <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>CLOs</th>
                                                        <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Tiêu chí đánh giá</th>
                                                        <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }}>Trọng số (%)</th>
                                                        <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }}>Hành động</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {courseOutcomes.assessmentMethods.map((method, idx) => (
                                                        <tr key={idx}>
                                                            <td style={{ border: "1px solid #ddd", padding: 8 }}>
                                                                <input
                                                                    style={{ ...inputStyle, margin: 0 }}
                                                                    disabled={!canEdit}
                                                                    value={method.component}
                                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                                        ...prev,
                                                                        assessmentMethods: prev.assessmentMethods.map((m, i) =>
                                                                            i === idx ? { ...m, component: e.target.value } : m
                                                                        )
                                                                    }))}
                                                                    placeholder="Đánh giá quá trình"
                                                                />
                                                            </td>
                                                            <td style={{ border: "1px solid #ddd", padding: 8 }}>
                                                                <input
                                                                    style={{ ...inputStyle, margin: 0 }}
                                                                    disabled={!canEdit}
                                                                    value={method.method}
                                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                                        ...prev,
                                                                        assessmentMethods: prev.assessmentMethods.map((m, i) =>
                                                                            i === idx ? { ...m, method: e.target.value } : m
                                                                        )
                                                                    }))}
                                                                    placeholder="Chuyên cần"
                                                                />
                                                            </td>
                                                            <td style={{ border: "1px solid #ddd", padding: 8 }}>
                                                                <input
                                                                    style={{ ...inputStyle, margin: 0 }}
                                                                    disabled={!canEdit}
                                                                    value={method.clos}
                                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                                        ...prev,
                                                                        assessmentMethods: prev.assessmentMethods.map((m, i) =>
                                                                            i === idx ? { ...m, clos: e.target.value } : m
                                                                        )
                                                                    }))}
                                                                    placeholder="CLO1"
                                                                />
                                                            </td>
                                                            <td style={{ border: "1px solid #ddd", padding: 8 }}>
                                                                <input
                                                                    style={{ ...inputStyle, margin: 0 }}
                                                                    disabled={!canEdit}
                                                                    value={method.criteria}
                                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                                        ...prev,
                                                                        assessmentMethods: prev.assessmentMethods.map((m, i) =>
                                                                            i === idx ? { ...m, criteria: e.target.value } : m
                                                                        )
                                                                    }))}
                                                                    placeholder="A1.2"
                                                                />
                                                            </td>
                                                            <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }}>
                                                                <input
                                                                    style={{ ...inputStyle, margin: 0, width: 80, textAlign: "center" }}
                                                                    disabled={!canEdit}
                                                                    value={method.weight}
                                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                                        ...prev,
                                                                        assessmentMethods: prev.assessmentMethods.map((m, i) =>
                                                                            i === idx ? { ...m, weight: e.target.value } : m
                                                                        )
                                                                    }))}
                                                                    placeholder="10"
                                                                />
                                                            </td>
                                                            <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }}>
                                                                <button
                                                                    type="button"
                                                                    disabled={!canEdit}
                                                                    onClick={() => setCourseOutcomes(prev => ({
                                                                        ...prev,
                                                                        assessmentMethods: prev.assessmentMethods.filter((_, i) => i !== idx)
                                                                    }))}
                                                                    style={{
                                                                        padding: "4px 8px",
                                                                        backgroundColor: "#f3b5b5",
                                                                        color: "#b00020",
                                                                        border: "none",
                                                                        borderRadius: 4,
                                                                        cursor: !canEdit ? "not-allowed" : "pointer",
                                                                        fontSize: 12,
                                                                        opacity: !canEdit ? 0.5 : 1,
                                                                    }}
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={!canEdit}
                                            onClick={() => setCourseOutcomes(prev => ({
                                                ...prev,
                                                assessmentMethods: [...prev.assessmentMethods, { component: "", method: "", clos: "", criteria: "", weight: "" }]
                                            }))}
                                            style={{
                                                padding: "8px 12px",
                                                backgroundColor: "#e3f2fd",
                                                color: "#1976d2",
                                                border: "1px solid #1976d2",
                                                borderRadius: 6,
                                                cursor: !canEdit ? "not-allowed" : "pointer",
                                                opacity: !canEdit ? 0.5 : 1,
                                            }}
                                        >
                                            + Thêm hàng
                                        </button>
                                    </div>

                                    {/* SECTION 7: TEACHING PLAN */}
                                    <div style={{ marginBottom: 0 }}>
                                        <h3 style={{ marginTop: 0, marginBottom: 12, color: "#333" }}>
                                            7. Kế hoạch giảng dạy và học tập (Teaching and learning plan/outline)
                                        </h3>
                                        <div style={{ overflowX: "auto" }}>
                                            <table style={{
                                                width: "100%",
                                                borderCollapse: "collapse",
                                                fontSize: 13
                                            }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: "#f0f0f0" }}>
                                                        <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Tuần/Chương</th>
                                                        <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Nội dung</th>
                                                        <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>CLOs</th>
                                                        <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Hoạt động dạy và học</th>
                                                        <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Bài đánh giá</th>
                                                        <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }}>Hành động</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {courseOutcomes.teachingPlan.map((plan, idx) => (
                                                        <tr key={idx}>
                                                            <td style={{ border: "1px solid #ddd", padding: 8 }}>
                                                                <input
                                                                    style={{ ...inputStyle, margin: 0 }}
                                                                    disabled={!canEdit}
                                                                    value={plan.week}
                                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                                        ...prev,
                                                                        teachingPlan: prev.teachingPlan.map((p, i) =>
                                                                            i === idx ? { ...p, week: e.target.value } : p
                                                                        )
                                                                    }))}
                                                                    placeholder="Tuần 1/Chương 1"
                                                                />
                                                            </td>
                                                            <td style={{ border: "1px solid #ddd", padding: 8 }}>
                                                                <textarea
                                                                    style={{ ...inputStyle, margin: 0, minHeight: 60, resize: "vertical" }}
                                                                    disabled={!canEdit}
                                                                    value={plan.content}
                                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                                        ...prev,
                                                                        teachingPlan: prev.teachingPlan.map((p, i) =>
                                                                            i === idx ? { ...p, content: e.target.value } : p
                                                                        )
                                                                    }))}
                                                                    placeholder="Nội dung chi tiết"
                                                                />
                                                            </td>
                                                            <td style={{ border: "1px solid #ddd", padding: 8 }}>
                                                                <input
                                                                    style={{ ...inputStyle, margin: 0 }}
                                                                    disabled={!canEdit}
                                                                    value={plan.clos}
                                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                                        ...prev,
                                                                        teachingPlan: prev.teachingPlan.map((p, i) =>
                                                                            i === idx ? { ...p, clos: e.target.value } : p
                                                                        )
                                                                    }))}
                                                                    placeholder="CLO1"
                                                                />
                                                            </td>
                                                            <td style={{ border: "1px solid #ddd", padding: 8 }}>
                                                                <textarea
                                                                    style={{ ...inputStyle, margin: 0, minHeight: 60, resize: "vertical" }}
                                                                    disabled={!canEdit}
                                                                    value={plan.teaching}
                                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                                        ...prev,
                                                                        teachingPlan: prev.teachingPlan.map((p, i) =>
                                                                            i === idx ? { ...p, teaching: e.target.value } : p
                                                                        )
                                                                    }))}
                                                                    placeholder="Giảng viên: ..., Sinh viên: ..."
                                                                />
                                                            </td>
                                                            <td style={{ border: "1px solid #ddd", padding: 8 }}>
                                                                <input
                                                                    style={{ ...inputStyle, margin: 0 }}
                                                                    disabled={!canEdit}
                                                                    value={plan.assessment}
                                                                    onChange={(e) => setCourseOutcomes(prev => ({
                                                                        ...prev,
                                                                        teachingPlan: prev.teachingPlan.map((p, i) =>
                                                                            i === idx ? { ...p, assessment: e.target.value } : p
                                                                        )
                                                                    }))}
                                                                    placeholder="A1.2"
                                                                />
                                                            </td>
                                                            <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }}>
                                                                <button
                                                                    type="button"
                                                                    disabled={!canEdit}
                                                                    onClick={() => setCourseOutcomes(prev => ({
                                                                        ...prev,
                                                                        teachingPlan: prev.teachingPlan.filter((_, i) => i !== idx)
                                                                    }))}
                                                                    style={{
                                                                        padding: "4px 8px",
                                                                        backgroundColor: "#f3b5b5",
                                                                        color: "#b00020",
                                                                        border: "none",
                                                                        borderRadius: 4,
                                                                        cursor: !canEdit ? "not-allowed" : "pointer",
                                                                        fontSize: 12,
                                                                        opacity: !canEdit ? 0.5 : 1,
                                                                    }}
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={!canEdit}
                                            onClick={() => setCourseOutcomes(prev => ({
                                                ...prev,
                                                teachingPlan: [...prev.teachingPlan, { week: "", chapter: "", content: "", clos: "", teaching: "", assessment: "" }]
                                            }))}
                                            style={{
                                                padding: "8px 12px",
                                                marginTop: 12,
                                                backgroundColor: "#e3f2fd",
                                                color: "#1976d2",
                                                border: "1px solid #1976d2",
                                                borderRadius: 6,
                                                cursor: !canEdit ? "not-allowed" : "pointer",
                                                opacity: !canEdit ? 0.5 : 1,
                                            }}
                                        >
                                            + Thêm hàng
                                        </button>
                                    </div>

                                </div>
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
                                    style={{ marginLeft: "auto", backgroundColor: "#f3b5b5", color: "#b00020" }}
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
