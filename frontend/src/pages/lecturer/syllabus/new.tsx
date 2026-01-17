import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { lecturerApi } from "../../../services/lecturer";
import type { CreateSyllabusRequest } from "../../../services/syllabus";

import { getMyCourses, type Course } from "../../../services/course";
import { getToken, hasRole } from "../../../services/auth";

import "../../../assets/css/pages/lecturersyllabus.css";

function useQuery() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

export default function LecturerSyllabusNewPage() {
    const navigate = useNavigate();
    const params = useParams();
    const query = useQuery();

    const isLecturer = hasRole("LECTURER");
    if (!isLecturer) {
        return (
            <div className="syllabus-new-page">
                <div className="error-box">❌ Bạn không có quyền (LECTURER)</div>
            </div>
        );
    }

    const initialCourseId =
        Number(query.get("courseId")) || Number((params as any).courseId) || 0;

    const [form, setForm] = useState<CreateSyllabusRequest>({
        courseId: initialCourseId,
        title: "",
        description: "",
        academicYear: "",
        semester: "",
    });

    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string>("");

    // ✅ load danh sách course của lecturer
    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) {
            setError("Bạn chưa đăng nhập (thiếu token).");
            setLoadingCourses(false);
            return;
        }
        if (!isLecturer) {
            setError("Bạn không có quyền truy cập trang này (LECTURER).");
            setLoadingCourses(false);
            return;
        }

        let mounted = true;

        (async () => {
            setLoadingCourses(true);
            setError("");
            try {
                const data = await getMyCourses(); // ✅ giống LecturerPage
                if (!mounted) return;

                setCourses(data || []);

                if ((initialCourseId || 0) <= 0 && (data?.length || 0) > 0) {
                    setForm((p) => ({ ...p, courseId: data[0].id }));
                }
            } catch (err: any) {
                if (!mounted) return;

                const status = err?.response?.status;
                const resp = err?.response?.data;

                if (status === 401 || status === 403) {
                    setError("Phiên đăng nhập hết hạn hoặc bạn không có quyền LECTURER.");
                } else {
                    const msg =
                        resp?.message || resp || err?.message || "Không tải được danh sách khóa học";
                    setError(typeof msg === "string" ? msg : "Không tải được danh sách khóa học");
                }
            } finally {
                if (mounted) setLoadingCourses(false);
            }
        })();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLecturer]);


    const canSubmit =
        form.courseId > 0 && form.title.trim().length > 0 && !submitting;

    const onChange = (key: keyof CreateSyllabusRequest, value: string | number) =>
        setForm((prev) => ({ ...prev, [key]: value as any }));

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!canSubmit) {
            setError("Vui lòng chọn môn học và nhập Title.");
            return;
        }

        try {
            setSubmitting(true);

            await lecturerApi.createSyllabus({
                ...form,
                title: form.title.trim(),
                description: form.description?.trim() || undefined,
                academicYear: form.academicYear?.trim() || undefined,
                semester: form.semester?.trim() || undefined,
            });

            navigate(`/lecturer/courses/${form.courseId}`);
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Tạo syllabus thất bại.";
            setError(String(msg));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="syllabus-new-page">
            <h2>Tạo Syllabus</h2>

            {error && <div className="error-box">{error}</div>}

            <form className="syllabus-form" onSubmit={onSubmit}>
                <div className="form-grid">
                    <div>
                        <label>
                            Môn học <span>*</span>
                        </label>

                        <select
                            value={form.courseId || 0}
                            onChange={(e) => onChange("courseId", Number(e.target.value))}
                            disabled={loadingCourses || courses.length === 0}
                            required
                        >
                            {loadingCourses ? (
                                <option value={0}>Đang tải danh sách môn...</option>
                            ) : courses.length === 0 ? (
                                <option value={0}>Không có môn học nào</option>
                            ) : (
                                courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.code ? `${c.code} - ` : ""}
                                        {c.name || `Course #${c.id}`}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <div>
                        <label>Semester</label>
                        <input
                            value={form.semester || ""}
                            onChange={(e) => onChange("semester", e.target.value)}
                        />
                    </div>

                    <div>
                        <label>
                            Title <span>*</span>
                        </label>
                        <input
                            value={form.title}
                            onChange={(e) => onChange("title", e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label>Academic Year</label>
                        <input
                            value={form.academicYear || ""}
                            onChange={(e) => onChange("academicYear", e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        value={form.description || ""}
                        onChange={(e) => onChange("description", e.target.value)}
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={!canSubmit}>
                        {submitting ? "Đang lưu..." : "Tạo syllabus"}
                    </button>

                    <button type="button" className="cancel" onClick={() => navigate(-1)}>
                        Huỷ
                    </button>
                </div>
            </form>
        </div>
    );
}
